import React from "react"
import PropTypes from "prop-types"
import { Link, navigate } from "gatsby"
import { AppProvider, Card } from "@shopify/polaris"

import GraphqlProvider from "../providers/graphql"
import { getFirebase } from "../helpers/firebase"
import FirebaseContext from "../providers/firebase"

import "@shopify/polaris/styles.css"

import { 
    getShopToken,
    getShopDomain,
    isAuthenticated, 
    setHmacQueryCookie,
    getAuthUID,
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

            if (!shop || shop === null || typeof shop == "undefined") {
                navigate(
                    `/install/`,
                    {
                        replace: true,
                    }
                )
            }
        }

        this.state = {
            shop,
            token: null,
            isLoading: true,
        }
    }

    componentDidMount = async () => {
        let isAuth = false
        const queryParams = window.location.search
        const { shop: shopDomain } = this.state

        if (queryParams && queryParams.includes('shop')) {
            setHmacQueryCookie(queryParams)
        }

        isAuth = await isAuthenticated()

        const token = getShopToken(shopDomain)

        if (isAuth) {
            const userToken = getAuthUID(shopDomain);

            if (userToken) {
                const app = import('firebase/app')
                const auth = import('firebase/auth')
                const database = import('firebase/firestore')

                Promise.all([app, auth, database]).then(values => {
                    const firebase = getFirebase(values[0], userToken)

                    this.setState({
                        firebase,
                        token,
                        isLoading: false,
                    })
                })
            } else {
                // show login button/screen -- redirect to reauth
                console.warn('no user token found')
            }
        }
    }

    render() {
        const { shop, token, isLoading, firebase } = this.state
        //let appTitle = '' // convert to new Gatsy useStaticQuery hook
        let content = ''

        if (!shop || shop === null || typeof shop == "undefined") {
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
                <FirebaseContext.Provider value={firebase}>
                    <GraphqlProvider
                        shop={shop}
                        token={token}
                    >
                        {this.props.children}
                    </GraphqlProvider>
                </FirebaseContext.Provider>
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
