import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql, Link } from "gatsby"
import GraphqlProvider from "../providers/graphql"
import { AppProvider, Card } from "@shopify/polaris"

import "@shopify/polaris/styles.css"

import { getShopToken, isAuthenticated } from "../helpers/auth"
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
        token: null,
        isLoading: true,
    }

    componentDidMount = async () => {
        if (typeof window !== 'undefined') {
            const { shop } = await isAuthenticated()
            const token = await getShopToken(shop)

            this.setState({
                shop,
                token,
                isLoading: false,
            })
        }
    }

    render() {
        const { shop, token, isLoading } = this.state
        const shopDomain = shop
        //let appTitle = '' // convert to new Gatsy useStaticQuery hook
        let content = ''

        if (isLoading) {
            content = (
                <Card>
                    <Card.Section>
                        <p>Initializing app...</p>
                    </Card.Section>
                </Card>
            )
        } else if (!shopDomain || shopDomain === null) {
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
                    shop={shopDomain}
                    token={token}
                >
                    {this.props.children}
                </GraphqlProvider>
            )
        }

        return (
            <StaticQuery
                query={graphql`
                    query SiteTitleQuery2 {
                        site {
                            siteMetadata {
                                shopifyApiKey
                            }
                        }
                    }
                `}
                render={data => {
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
