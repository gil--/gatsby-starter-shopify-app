import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql, Link } from "gatsby"
import "@shopify/polaris/styles.css"
import GraphqlProvider from "../providers/graphql"
import Header from "../components/header"
import { AppProvider } from "@shopify/polaris"
import { getShopToken, isAuthenticated } from "../helpers/auth"

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

    componentDidMount() {
        const urlParamString = this.props.children.props.location.state && this.props.children.props.location.state.params
        const { shop } = isAuthenticated(urlParamString)

        this.setState({
            shop,
            isLoading: false,
        })
    }

    render() {
        const { shop, isLoading } = this.state
        const token = getShopToken(shop)

        if (isLoading) {
            return (
                <>
                    <p>Initializing app...</p>
                </>
            )
        }

        if (!shop || shop === null) {
            return (
                <>
                    <p>Error initializing app...</p>
                    <Link to="/install">Re-Install App</Link>
                </>
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
                render={data => (
                    <AppProvider
                        shopOrigin={shop}
                        apiKey={data.site.siteMetadata.shopifyApiKey}
                        linkComponent={CustomLinkComponent}
                        forceRedirect={(process.env.NODE_ENV === 'development') ? false : true}
                    >
                        <GraphqlProvider
                            shop={shop}
                            token={token}
                        >
                            <main>{this.props.children}</main>
                            <footer>
                                © {new Date().getFullYear()}. {data.site.siteMetadata.title}
                            </footer>
                        </GraphqlProvider>
                    </AppProvider>
                )}
            />
        )
    }
}

AppLayout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default AppLayout
