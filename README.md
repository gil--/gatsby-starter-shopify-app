# Gatsby Starter Shopify App

This Gatsby starter is a serverless Shopify app which runs using Firebase hosting and Firebase functions. It will allow for authenticated Shopify app access.

> **Warning:** This app is not production ready. PRs are welcome as development continues towards a stable v1.0.0 release.

## Features
- Firebase Firestore Realtime DB
- Serverless Functions API layer
- Admin Graphql Serverless Proxy
- Shopify Polaris ready (AppProvider, etc.)
- CircleCI Config for easy continuous deployments to Firebase

## Setup
1. Run `yarn` or `npm install` to install all depdencies
2. Install Firebase CLI globally `npm i -g firebase-cli`
3. Login to Firebase `firebase login`.
4. Create a new Firebase project from the [Firebase Console](https://console.firebase.google.com/).
5. Create a new file called `.env.development` in the root of this project and navigate to the `General Settings` page and copy the **Project ID** into .env. Set this to `FIREBASE_PROJECT_ID=`:

```bash
FIREBASE_PROJECT_ID=example-project-id
```

6. Register a new [Shopify App](https://partners.shopify.com) in your Partners portal.
7. Copy the API key and set it as *SHOPIFY_APP_API_KEY* in .env.development.
8. Go to `https://console.firebase.google.com/project/{FIREBASE-APP-NAME-HERE}/settings/serviceaccounts/adminsdk` or Project Settings > Service accounts. Now generate a new Firebase Admin SDK for Node.js and click the "Generate new private key". This will download a json file which we will use to authenticate to the Firebase Admin SDK from within our functions.

9. Run `firebase login` to login and authenticate.
10. Run `firebase init functions` and select the project you created in step 2.
11. Add required local variables to Firebase config:

```bash
firebase functions:config:set \
fire.project_id="PLACEHOLDER" \
fire.client_email="PLACEHOLDER" \
fire.private_key="PLACEHOLDER" \
shopify.app_api_key="PLACEHOLDER" \
shopify.app_shared_secret="PLACEHOLDER" \
shopify.app_url="PLACEHOLDER" \
shopify.app_name_url="PLACEHOLDER" \
shopify.app_scopes="PLACEHOLDER"
```

> Note that app_url should be along the lines of `https://{FIREBASE-APP-NAME-HERE}.firebaseapp.com`. For example (do not use this as it won't work):

```bash
firebase functions:config:set \
fire.app_project_id="PLACEHOLDER" \
fire.client_email="PLACEHOLDER" \
fire.private_key="PLACEHOLDER" \
shopify.app_api_key="13291e0f4f91f65b7e87634598a23cf9" \
shopify.app_shared_secret="ee24a5654348b3b5686d4ab5fb2199cf" \
shopify.app_url="http://azd2ze7c.ngrok.io" \
shopify.app_name_url="my-firebase-app" \
shopify.app_scopes="read_orders"
```

12. To successfully use these env variables during local development, we need to download them to the `/functions` directory. To download, run: `cd ./functions && firebase functions:config:get>.runtimeconfig.json && cd ../`

13. In the Firebase console `https://console.firebase.google.com`, select your project and navigate to Database where you'll create a **Firestore Database**. Add a root collection called shops and add a base document with the following attributes:

| Name | Type | Value |
| :- | :- | :- |
| **Document Id** | | shopify.myshopify.com |
| |  |
| shop | string | shopify.myshopify.com |
| createdAt | timestamp | |
| updatedAt | timestamp | |

## API Layer

This Shopify App runs on Firebase serverless infrastructure using Firebase functions as the API layer. There are three main API routes:

| API URL | Purpose |
| :- | :- |
| **/auth** | Begins initial process to create Shopify Admin authentication keys |
| **/callback** | Create authentication keys, setups up or updates store information in Firestore, and creates billing subscription |
| **/activate_charge** | Active App Subscription Charge |
| **/graphql** | Proxies all Shopify admin API requests. Requires account with billing enabled. Note that Firebase functions does not allow external API requests on free accounts. As a result, you must add billing information to your Firebase account to successfully proxy the Shopify admin API. |

> We currently don't use the common */api/**/* Firebase functions syntax with Express as I've found splitting the routes allows for easier debugging and clearer analytics. Cold starts have also gotten much better with Firebase functions which was one of the main drivers behind putting all API functions behind a common route.

## Shopify Configurations

### Access Mode

Shopify has two types of [access modes](https://help.shopify.com/en/api/getting-started/authentication/oauth/api-access-modes), *online access* and *offline access*. You can read the official Shopify article for more information but it's important to note that this Shopify app is setup to use the online access token. This simply means that instead of a per-store access code, it's per store admin user. The main reasoning is that this app is serverless and as a result no server-side session logic resulting in the access token being store in the browser. Since the token can be easily revoked by the admin user and it expires in 24 hours, it's safer than using a long-lasting offline access token.

### API Scopes

Whenever a merchant installs a Shopify app, they are presented with a permission screen asking to accept an app's request to access certain data such as orders, customers, and products. The app knows which permissions to accept through the `scopes` setting. This is set as the Firebase configuration value of `shopify.app_scopes`. Shopify has a [full list](https://help.shopify.com/en/api/getting-started/authentication/oauth/scopes) of API access scopes.

## Bugs/Issues
- Missing Billing API Integration (Charge Monthly Subscription)
- Missing Webhooks (uninstall, GDPR, etc.)
- Not *yet* production ready
- Missing Integration Tests
- Missing better bug tracking/integration (BugSnag or equivalent)