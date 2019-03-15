const ShopifyApi = require('shopify-api-node');
const functions = require('firebase-functions');

const ACTIVATE_CHARGE_ROUTE = '/activate_charge';
const APP_PLAN_NAME = '(test2) Starter Plan';

exports.getShopifyApi = session => {
    const { shop, token } = session;

    return new ShopifyApi({
        shopName: shop,
        accessToken: token
    });
};

exports.createRecurringApplicationCharge = async ({ shopify, shop, token, hasTrial = false }) => {
    let appCharge = {
        name: APP_PLAN_NAME,
        price: 24.99,
        return_url: `${functions.config().shopify.app_url}${ACTIVATE_CHARGE_ROUTE}?shop=${shop}&token=${token}&`,
        test: true,
    };

    if (hasTrial) {
        appCharge.trial_days = 7;
    }

    try {
        const charge = await shopify.recurringApplicationCharge.create(appCharge);
        return charge.confirmation_url;
        /*
            Example Charge Response
        { 
            id: 3045228591,
            name: '(test) Starter Plan',
            api_client_id: 2776387,
            price: '24.99',
            status: 'pending',
            return_url: 'https://2dbb9959.ngrok.io/activate_charge',
            billing_on: null,
            created_at: '2019-03-14T19:28:01-04:00',
            updated_at: '2019-03-14T19:28:01-04:00',
            test: true,
            activated_on: null,
            cancelled_on: null,
            trial_days: 7,
            trial_ends_on: null,
            decorated_return_url: 'https://2dbb9959.ngrok.io/activate_charge?charge_id=3045228591',
            confirmation_url: 'https://gatsbyjs.myshopify.com/admin/charges/3045228591/' 
        }
        */    
    } catch(error) {
        console.warn(error);
    }

    return false;
};

exports.hasActiveRecurringApplicationCharge = async (shopify) => {
    try {
        const charges = await shopify.recurringApplicationCharge.list();

        // make sure the charge is ACTIVE and expected PLAN
        const activeCharge = charges.find(charge => charge.status === 'active' && charge.name === APP_PLAN_NAME);

        if (activeCharge) {
            return true;
        }
    } catch(error) {
        console.warn(error);
    }

    return false;
};