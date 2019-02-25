const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

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
        response.status(500).json({ status: 'error', body: 'Error mising required headers' });
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