# Gatsby Starter Shopify App

This Gatsby starter is a serverless Shopify app which runs using Firebase hosting and Firebase functions. It will allow for authenticated Shopify app access.

## Features
- Firebase Firestore Realtime DB
- Serverless Functions API layer
- Admin Graphql Serverless Proxy
- Shopify Polaris ready (AppProvider, etc.)
- CircleCI Config for easy continuous deployments to Firebase

## Setup
1. Run `yarn` or `npm install` to install all depdencies
2. Create a new Firebase project from the [Firebase Console](https://console.firebase.google.com/).
3. Create a new file called `.env.development` in the root of this project and navigate to the `General Settings` page and copy the **Project ID** into .env. Set this to `FIREBASE_PROJECT_ID=`:

```
FIREBASE_PROJECT_ID=example-project-id
```

4. Register a new [Shopify App](https://partners.shopify.com) in your Partners portal.
5. Copy the API key and set it as *SHOPIFY_APP_API_KEY* in .env.development.
6. Run `firebase login` to login and authenticate.
7. Run `firebase init functions` and select the project you created in step 2.


## API Layer

This Shopify App runs on Firebase serverless infrastructure using Firebase functions as the API layer. There are three main API routes:

| API URL | Purpose |
| :- | :- |
| **/auth** | Begins initial process to create Shopify Admin authentication keys |
| **/callback** | Create authentication keys, setups up or updates store information in Firestore, and creates billing subscription |
| **/graphql** | Proxies all Shopify admin API requests. Requires account with billing enabled. Note that Firebase functions does not allow external API requests on free accounts. As a result, you must add billing information to your Firebase account to successfully proxy the Shopify admin API. |

> We currently don't use the common */api/**/* Firebase functions syntax with Express as I've found splitting the routes allows for easier debugging and clearer analytics. Cold starts have also gotten much better with Firebase functions which was one of the main drivers behind putting all API functions behind a common route.

## Bugs/Issues
- Does not run on Safari (iOS/Desktop)
- Missing Billing API Integration (Charge Monthly Subscription)
- Missing Webhooks (uninstall, GDPR, etc.)
- Not *yet* production ready
- Missing Integration Tests