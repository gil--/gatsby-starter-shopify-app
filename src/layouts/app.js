import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql, Link } from "gatsby"
import GraphqlProvider from "../providers/graphql"
import { AppProvider, Card, Layout, Page } from "@shopify/polaris"

import "@shopify/polaris/styles.css"

import { getShopToken, getShopDomain } from "../helpers/auth"
//import Header from "../components/header"

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
    )
}
class AppLayout extends React.Component {
    state = {
        shop: null,
        isLoading: true,
    }

    componentDidMount = async () => {
        const shop = this.props.children.props.location.state && this.props.children.props.location.state.shopDomain;

        this.setState({
            shop,
            isLoading: false,
        })
    }

    render() {
        const { shop, isLoading } = this.state
        const token = getShopToken(shop)
        const shopDomain = getShopDomain()
        let siteTitle = '' // convert to new Gatsy useStaticQuery hook
        let content = ''

        if (isLoading) {
            content = (
                <Card>
                    <Card.Section>
                        <p>Initializing app...</p>
                    </Card.Section>
                </Card>
            )
        } else if (!shop || shop === null) {
            content = (
                <Card>
                    <Card.Section>
                        <p>Error initializing app...</p>
                        <Link to="/install">Re-Install App</Link>
                    </Card.Section>
                </Card>
            
            )
        } else {
            content = (
                <GraphqlProvider
                    shop={shop}
                    token={token}
                >
                    <Page>
                        <Layout>
                            <Layout.Section>
                                <main>{this.props.children}</main>
                                <footer>
                                    © {new Date().getFullYear()}. {siteTitle}
                                </footer>
                            </Layout.Section>
                        </Layout>
                    </Page>
                </GraphqlProvider>
            )
        }

        return (
            <StaticQuery
                query={graphql`
                    query SiteTitleQuery2 {
                        site {
                        siteMetadata {
                            title
                            shopifyApiKey
                        }
                        }
                    }
                `}
                render={data => {
                    siteTitle = data.site.siteMetadata.title
                    return (
                        <AppProvider
                            shopOrigin={shop || shopDomain}
                            apiKey={data.site.siteMetadata.shopifyApiKey}
                            linkComponent={CustomLinkComponent}
                            forceRedirect={(process.env.NODE_ENV === 'development') ? false : true}
                        >
                            {content}
                        </AppProvider>
                    )
                }}
            />
        )
    }
}

AppLayout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default AppLayout
