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
