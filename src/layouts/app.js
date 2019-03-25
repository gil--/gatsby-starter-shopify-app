import React from "react"
import PropTypes from "prop-types"
import { Link, navigate } from "gatsby"
import GraphqlProvider from "../providers/graphql"
import { AppProvider, Card } from "@shopify/polaris"

import "@shopify/polaris/styles.css"

import { 
    getShopToken,
    getShopDomain,
    isAuthenticated, 
    setHmacQueryCookie,
} from "../helpers/auth"
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
    constructor(props) {
        super(props)

        let shop = null

        if (typeof window !== 'undefined') {
            shop = getShopDomain()

            if (!shop || shop === null || typeof shop === "undefined") {
                navigate(
                    `/install/`,
                    {
                        replace: true,
                    }
                )
            }

            console.log(shop)
        }

        this.state = {
            shop,
            token: null,
            isLoading: true,
        }
    }

    componentDidMount = async () => {
        if (typeof window !== 'undefined') {
            let isAuth = false
            const queryParams = window.location.search

            if (queryParams && queryParams.includes('shop')) {
                setHmacQueryCookie(queryParams)
            }

            isAuth = await isAuthenticated()

            const token = getShopToken(this.state.shop)

            if (isAuth) {
                this.setState({
                    token,
                    isLoading: false,
                })
            }
        }
    }

    render() {
        const { shop, token, isLoading } = this.state
        //let appTitle = '' // convert to new Gatsy useStaticQuery hook
        let content = ''

        if (!shop || shop === null || typeof shop === "undefined") {
            return <p>Redirecting...</p>
        }

        if (isLoading) {
            content = (
                <Card>
                    <Card.Section>
                        <p>Initializing app...</p>
                    </Card.Section>
                </Card>
            )
        } else {
            content = (
                <GraphqlProvider
                    shop={shop}
                    token={token}
                >
                    {this.props.children}
                </GraphqlProvider>
            )
        }

        return (
            <AppProvider
                shopOrigin={shop}
                apiKey={process.env.GATSBY_SHOPIFY_APP_API_KEY}
                linkComponent={CustomLinkComponent}
                forceRedirect={(process.env.NODE_ENV === 'development') ? false : true}
            >
                {content}
            </AppProvider> 
        )
    }
}

AppLayout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default AppLayout
