const proxy = require("http-proxy-middleware")

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_APP_ZONE,
} = process.env;

module.exports = {
  siteMetadata: {
    title: `Gatsby Starter Shopify App`,
    description: `A Gatsby Starter to create a Shopify App`,
    author: `@gilgnyc`,
  },
  plugins: [
    `gatsby-plugin-layout`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    // 'gatsby-plugin-offline',
  ],
  developMiddleware: app => {
    app.use(
      "/auth",
      proxy({
        target: "http://localhost:5001",
        pathRewrite: {
          "/auth": `/${FIREBASE_PROJECT_ID}/${FIREBASE_APP_ZONE || 'us-central1'}/auth`,
        },
      })
    )

    // Firebase Function Routes

    app.use(
      "/callback",
      proxy({
        target: "http://localhost:5001",
        pathRewrite: {
          "/callback": `/${FIREBASE_PROJECT_ID}/${FIREBASE_APP_ZONE || 'us-central1'}/callback`,
        },
      })
    )

    app.use(
      "/graphql",
      proxy({
        target: "http://localhost:5001",
        pathRewrite: {
          "/graphql": `/${FIREBASE_PROJECT_ID}/${FIREBASE_APP_ZONE || 'us-central1'}/graphql`,
        },
      })
    )

    app.use(
      "/activate_charge",
      proxy({
        target: "http://localhost:5001",
        pathRewrite: {
          "/activate_charge": `/${FIREBASE_PROJECT_ID}/${FIREBASE_APP_ZONE || 'us-central1'}/activate_charge`,
        },
      })
    )

    app.use(
      "/webhook/uninstall",
      proxy({
        target: "http://localhost:5001",
        pathRewrite: {
          "/webhook/uninstall": `/${FIREBASE_PROJECT_ID}/${FIREBASE_APP_ZONE || 'us-central1'}/uninstall`,
        },
      })
    )

    app.use(
      "/webhook/customer_redact",
      proxy({
        target: "http://localhost:5001",
        pathRewrite: {
          "/webhook/customer_redact": `/${FIREBASE_PROJECT_ID}/${FIREBASE_APP_ZONE || 'us-central1'}/customer_redact`,
        },
      })
    )

    app.use(
      "/webhook/customers_data_request",
      proxy({
        target: "http://localhost:5001",
        pathRewrite: {
          "/webhook/customers_data_request": `/${FIREBASE_PROJECT_ID}/${FIREBASE_APP_ZONE || 'us-central1'}/customers_data_request`,
        },
      })
    )

    app.use(
      "/webhook/shop_redact",
      proxy({
        target: "http://localhost:5001",
        pathRewrite: {
          "/webhook/shop_redact": `/${FIREBASE_PROJECT_ID}/${FIREBASE_APP_ZONE || 'us-central1'}/shop_redact`,
        },
      })
    )
  },
}
