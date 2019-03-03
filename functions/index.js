const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const ShopifyToken = require('shopify-token');

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
        console.log(e);
        return response.status(500).json({ status: 'error' });
    }
});


/*
    /api/callback

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
            
            if (!shopDoc.exists) {
                // shop doesn't exist; let's create                            
                shopRef.set({
                    shop,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
            }

            const userRef = db.collection(`shops/${shop}/users`).doc(`${tokenData.associated_user.id}`)
            userRef.set(tokenData)

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
        console.log(e)
        return response.status(500).json({ status: 'Error occurred', error: e.stack })
    }
});

/*
    Shopify Graphql Proxy Middleware
*/
exports.graphql = functions.https.onRequest(async (request, response) => {
    // Make sure method is POST
    if (request.method === "GET") {
        response.status(500).json({ status: 'error', body: 'Error. Method must be POST' });
        return;
    }

    const shop = request.get('x-shopify-shop-domain');
    const shopAccessToken = request.get('x-shopify-access-token');
    const graphqlEndpoint = `https://${shop}/admin/api/graphql.json`;
    const query = request.body;

    if (!shopAccessToken || !shop || !query) {
        console.log('Missing access token or shop');
        response.status(403).json({ status: 'error', body: 'Error mising required headers' });
        return;
    }

    try {
        return await axios({
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
                return;
            }

            response.status(200).json(result.data);
            return;
        }).catch(error => {
            response.status(500).json({ status: 'error', body: error.response && error.response.data.errors });
            return;
        })
    } catch (error) {
        console.log(error.response);
        response.status(500).json({ status: 'error', body: error.response && error.response.data.errors });
        return;
    }
});
