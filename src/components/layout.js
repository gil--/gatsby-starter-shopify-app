import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql, Link } from "gatsby"
import { AppProvider } from "@shopify/polaris"
import "@shopify/polaris/styles.css"

import Header from "./header"

const CustomLinkComponent = ({ children, url, external, ...rest }) => {
  if (external) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      to={url}
      {...rest}
    >
      {children}
    </Link>
  );
};

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
            shopifyApiKey
          }
        }
      }
    `}
    render={data => {
      console.log(data.site.siteMetadata.shopifyApiKey)
      return (
      <>
        <AppProvider
          shopOrigin="gatsbyjs.myshopify.com"
          apiKey={data.site.siteMetadata.shopifyApiKey}
          linkComponent={CustomLinkComponent}
          forceRedirect={(process.env.NODE_ENV === 'development') ? false : true}
        >
          <>
            <Header siteTitle={data.site.siteMetadata.title} />
            <main>{children}</main>
            <footer>
              © {new Date().getFullYear()}. {data.site.siteMetadata.title}
            </footer>
          </>
        </AppProvider>
      </>
    )}}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
