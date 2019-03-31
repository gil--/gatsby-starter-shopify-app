const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const ShopifyToken = require('shopify-token');

const { 
    getShopifyApi, 
    createRecurringApplicationCharge, 
    hasActiveRecurringApplicationCharge,
    verifyWebhook,
} = require('./helpers/shopify');

const {
    APP_PLAN_NAME,
} = require('./config');

const SHOPIFY_APP_NAME_URL = functions.config().shopify.app_name_url;
const SHOPIFY_APP_URL = functions.config().shopify.app_url;

const shopifyToken = new ShopifyToken({
    redirectUri: `${SHOPIFY_APP_URL}/callback`,
    sharedSecret: functions.config().shopify.app_shared_secret,
    apiKey: functions.config().shopify.app_api_key,
    scopes: functions.config().shopify.app_scopes,
    accessMode: 'per-user',
    timeout: 10000,
});

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: functions.config().fire.project_id,
        clientEmail: functions.config().fire.client_email,
        privateKey: functions.config().fire.private_key.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${functions.config().fire.project_id}.firebaseio.com`
})

/*
    /auth

    Start initial Auth Process
*/
exports.auth = functions.https.onRequest(async (request, response) => {
    try {
        if (!request.body) {
            return response.status(400).json({ status: 'error', body: 'Bad Request' });
        }

        const { shop } = request.body;
        if (!shop) {
            console.log('Missing {shop} in body');
            return response.status(422).json({ status: 'error', body: 'Unprocessable Entity' });
        }

        shopifyToken.shop = shop.replace('.myshopify.com', ''); // TODO: remove, already handled in app
        const nonce = shopifyToken.generateNonce();
        const uri = shopifyToken.generateAuthUrl(shopifyToken.shop, undefined, nonce);

        console.log(`Redirect to ${uri}`);
        return response.status(200).json({ status: 'success', body: uri });
    } catch (e) {
        console.warn(e);
        return response.status(500).json({ status: 'error' });
    }
});


/*
    /callback

    Finish auth process and add shop to Firestore
*/
exports.callback = functions.https.onRequest(async (request, response) => {
    try {
        const db = admin.firestore();

        const { code, shop, hmac, timestamp } = request.query

        if (!shop || !code || !hmac || !timestamp) {
            return response.status(422).json({ status: 'Unprocessable Entity' })
        }

        if (shopifyToken.verifyHmac(request.query)) {
            // Get permanent access token that will be used in the future to make API calls
            const data = await shopifyToken.getAccessToken(shop, code)
            let timeNow = + new Date()
            const expiresAt = timeNow + (data.expires_in - 20 * 1000)
            const tokenData = { ...data, expires_at: expiresAt } // TODO: change from unix timestamp to Firestore date
            const token = tokenData.access_token

            // create firebase auth
            const customToken = await admin.auth().createCustomToken(shop + tokenData.associated_user.id, {
                shopifyToken: tokenData.access_token,
                userId: tokenData.associated_user.id,
            })

            if (!customToken) {
                return response.status(500).json({ status: 'Unable to generate a token' });
            }

            const query = `?token=${token}&shop=${shop}&expires_at=${expiresAt}&uid=${customToken}`
            console.log(`Generated token ${token} for shop ${shop}`)

            const shopRef = db.collection("shops").doc(shop)
            const shopDoc = await db.runTransaction(t => t.get(shopRef))
            let hasTrial = false
            
            if (!shopDoc.exists) {
                // shop doesn't exist; let's create
                hasTrial = true

                shopRef.set({
                    shop,
                    hasAppInstalled: true,
                    hasActiveSubscription: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
            } else {
                shopRef.set({
                    hasAppInstalled: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }

            const userRef = db.collection(`shops/${shop}/users`).doc(`${tokenData.associated_user.id}`)
            userRef.set(tokenData)

            /*
                App Subscription Charges
            */
            const shopify = getShopifyApi({ shop, token });

            const webhook = {
                topic: 'app/uninstalled',
                address: `${functions.config().shopify.app_url}/webhook/uninstall`,
                format: 'json'
            };

            // address: `${APP_URL}${UNINSTALL_ROUTE}`,

            shopify.webhook.create(webhook);

            const hasApplicationCharge = await hasActiveRecurringApplicationCharge(shopify);

            if (!hasApplicationCharge) {
                // let's begin billing process
                const chargeUrl = await createRecurringApplicationCharge({ shopify, shop, token, expiresAt, hasTrial });
                return response.status(200).redirect(chargeUrl);
            }

            /*
                App Redirection
            */

            // TODO: redirect to /auth/complete which will store creds and then redirect to index 
            //const redirectUrl = `https://${shop}/admin/apps/${SHOPIFY_APP_NAME_URL}/auth/complete${query}`
            const redirectUrl = `https://${shop}/admin/apps/${SHOPIFY_APP_NAME_URL}${query}`

            console.log(`${shop} successfully added new auth token!`)
            return response.status(200).redirect(redirectUrl)
        } else {
            console.error('Error validating hmac')
            return response.status(500).json({ error: 'Error validating hmac' })
        }
    } catch (e) {
        console.warn(e)
        return response.status(500).json({ status: 'Error occurred', error: e.stack })
    }
});

/*
    /api/activate-charge

    Shopify redirects to this route when a charge is accepted or declined
*/
exports.activateCharge = functions.https.onRequest(async (request, response) => {
    const { charge_id: chargeId, shop, token, expires_at, uid } = request.query;

    if (!chargeId || !shop || !token) {
        response.status(401).send('Error');
    }

    const db = admin.firestore();
    const shopRef = db.collection("shops").doc(shop)
    const shopify = getShopifyApi({ shop, token });
    const redirectUrl401 = `https://${shop}/admin/apps/${SHOPIFY_APP_NAME_URL}/charge-declined`;

    try {
        const charge = await shopify.recurringApplicationCharge.get(chargeId);
            
        if (charge.status === 'accepted') {

            shopRef.set({
                hasActiveSubscription: true,
                subscriptionPlan: APP_PLAN_NAME
            }, { merge: true });

            const isChargeActive = await shopify.recurringApplicationCharge.activate(chargeId);
            
            // We redirect to the home page of the app in Shopify admin
            const query = `?token=${token}&shop=${shop}&expires_at=${expires_at}&uid=${uid}`
            const redirectUrl = `https://${shop}/admin/apps/${SHOPIFY_APP_NAME_URL}${query}`

            response.status(200).redirect(redirectUrl);
            //  response.redirect(getEmbeddedAppHome(shop))
        } else {
            shopRef.set({
                hasActiveSubscription: false,
                subscriptionPlan: APP_PLAN_NAME
            }, { merge: true });

            response.status(401).redirect(redirectUrl401);
            // return response.render('charge_declined', { APP_URL });
        }
    } catch(error) {
        console.warn(error);
        response.status(401).redirect(redirectUrl401);
    }
});

/*
    /api/graphql

    Shopify Graphql Proxy Middleware
*/
exports.graphql = functions.https.onRequest(async (request, response) => {
    // Make sure method is POST
    if (request.method === "GET") {
        response.status(500).json({ status: 'error', body: 'Error. Method must be POST' });
        return
    }

    const shop = request.get('x-shopify-shop-domain');
    const shopAccessToken = request.get('x-shopify-access-token');
    const graphqlEndpoint = `https://${shop}/admin/api/graphql.json`;
    const query = request.body;

    if (!shopAccessToken || !shop || !query) {
        console.log('Missing access token or shop');
        response.status(403).json({ status: 'error', body: 'Error mising required headers' });
        return
    }

    try {
        await axios({
            method: 'POST',
            url: graphqlEndpoint,
            data: query,
            headers: {
                "X-Shopify-Access-Token": shopAccessToken,
                "Content-Type": 'application/json',
                "Accept": 'application/json',
            }
        }).then(result => {
            if (!result) {
                console.error('No data found');
                response.status(500).json({ status: 'error', body: 'No data found.' });
                return
            }

            response.status(200).json(result.data);
            return
        }).catch(error => {
            let errorCode = 500;
            
            if (error.response.data.errors.includes('Invalid API key or access token')) {
                console.error('Invalid API key or access token');
                errorCode = 401;
            }

            response.status(errorCode).json({ status: 'error', body: error.response && error.response.data.errors });
            return
        })
    } catch (error) {
        console.warn(error.response);
        response.status(500).json({ status: 'error', body: error.response && error.response.data.errors });
        return
    }
});

// =========================
// Webhook Routes
// =========================

/*
    /webhook/uninstall

    This gets called by the uninstall webhook.
    Perform app cleanup here.
*/
exports.webhookUninstall = functions.https.onRequest(async (request, response) => {
    const shop = request.get('x-shopify-shop-domain');
    const topic = 'app/uninstalled';

    if (!shop || !verifyWebhook(request, topic)) {
        console.warn(`Uninstall Webhook HMAC Failed for ${shop} on webhook ${topic}`);
        response.status(401).send('Webhook HMAC Failed');
        return;
    }

    // Do shop cleanup here
    const db = admin.firestore();
    const shopRef = await db.collection("shops").doc(shop)

    shopRef.set({
        hasActiveSubscription: false,
        hasAppInstalled: false,
    }, { merge: true });

    console.log(`Uninstalled ${shop} on webhook ${topic}`);
    response.status(200).send('Uninstalled');
    return;
});

/*******************************
    Mandatory GDPR Webhooks
    https://help.shopify.com/en/api/guides/gdpr-resources#mandatory-webhooks
*******************************/

/*
    /webhook/customer-redact

    Requests deletion of customer data
*/
exports.webhookCustomerRedact = functions.https.onRequest((request, response) => {
    const shop = request.get('x-shopify-shop-domain');
    const topic = 'customers/redact';

    if (!verifyWebhook(request, topic)) {
        console.warn(`Webhook failed for ${shop} on webhook ${topic}`);
        response.status(401).send('Webhook HMAC Failed');
        return;
    }

    // 
    // Implement customer cleanup here
    //

    console.log(`Successfully ran ${topic} for ${shop}`);
    response.status(200).send('');
    return;
});

/*
    /webhook/customers-data-request

    Requests to view stored customer data.
*/
exports.webhookCustomersDataRequest = functions.https.onRequest((request, response) => {
    const shop = request.get('x-shopify-shop-domain');
    const topic = 'customers/data_request';

    if (!verifyWebhook(request, topic)) {
        console.warn(`Webhook failed for ${shop} on webhook ${topic}`);
        response.status(401).send('Webhook HMAC Failed');
        return;
    }

    // 
    // Retrieve customer data here
    //

    console.log(`Successfully ran ${topic} for ${shop}`);
    response.status(200).send('');
    return;
});

/*
    /webhook/shop-redact

    Requests deletion of shop data.
*/
exports.webhookShopRedact = functions.https.onRequest((request, response) => {
    const shop = request.get('x-shopify-shop-domain');
    const topic = 'shop/redact';

    if (!verifyWebhook(request, topic)) {
        console.warn(`Webhook failed for ${shop} on webhook ${topic}`);
        response.status(401).send('Webhook HMAC Failed');
        return;
    }

    // 
    // Implement shop cleanup here
    //

    console.log(`Successfully ran ${topic} for ${shop}`);
    response.status(200).send('');
    return;
});