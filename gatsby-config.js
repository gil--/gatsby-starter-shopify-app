const proxy = require("http-proxy-middleware")
const dotenv = require("dotenv");

if (process.env.ENVIRONMENT !== "production") {
  dotenv.config();
}

const {
  SHOPIFY_APP_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_APP_ZONE,
} = process.env;

module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
  },
  plugins: [
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
  },
}
