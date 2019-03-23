import React from "react"
import { AppProvider, Page, Button, Card, Stack } from "@shopify/polaris"
import Cookies from "universal-cookie"

// Most of the code was adapted from https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth

class EnableCookies extends React.Component {
    constructor(props) {
        super(props)
        
        if (typeof window === 'undefined') {
            this.state = {
                showCookiePrompt: false,
                shop: null,
                apiKey: null,
                requestStorage: false,
            }

            return
        }

        const queryParams = window.location.search
        const urlParams = new URLSearchParams(queryParams)
        const shop = urlParams.get('shop')
        const apiKey = process.env.GATSBY_SHOPIFY_APP_API_KEY

        this.state = {
            showCookiePrompt: false,
            shop,
            apiKey,
            requestStorage: false,
        }
    }

    componentDidMount = async() => {
        if (typeof window !== 'undefined') {
            if (this.shouldDisplayPrompt()) {
                if (this.shouldPromptStorageAccess()) {
                    const hasAccess = await document.hasStorageAccess()
                    if (hasAccess) {
                        this.setCookieAndRedirect()
                    } else {
                        this.showCookiePrompt()
                        this.setState({
                            requestStorage: true,
                        })
                    }
                } else {
                    this.showCookiePrompt()
                }
            } else {
                this.setCookieAndRedirect()
            }
        }
    }

    showCookiePrompt = () => {
        this.setState({
            showCookiePrompt: true,
        })
    }

    setCookieAndRedirect = async() => {
        if (this.state.requestStorage) {
            const hasAccess = await document.requestStorageAccess()
            
            this.setCookie()
        } else {
            this.setCookie()
        }
    }

    setCookie() {
        const cookies = new Cookies()
        cookies.set('shopify.cookies_persist', true, { path: '/' })
        window.location.href = this.state.shop + "/admin/apps/" + this.state.apiKey
    }

    shouldPromptStorageAccess() {
        return !navigator.userAgent.match(/Version\/12\.0\.?\d? Safari/)
    }
    
    shouldDisplayPrompt() {
        if (navigator.userAgent.indexOf('com.jadedpixel.pos') !== -1) {
            return false
        }
        
        if (navigator.userAgent.indexOf('Shopify Mobile/iOS') !== -1) {
            return false
        }

        return Boolean(document.hasStorageAccess)
    }

    render() {
        const { apiKey, shop } = this.state

        if (!shop || !apiKey) {
            return (
                <p>Missing shop parameter.</p>
            )
        }

        return (
            <AppProvider
                shopOrigin={shop}
                apiKey={apiKey}
                forceRedirect={false}
            >
                <Page title="Redirecting…">
                {
                    this.state.showCookiePrompt && (
                        <Stack vertical={true}>
                            <Card title="Enable cookies">
                                <Card.Section>
                                    <p>You must manually enable cookies in this browser in order to use this app within Shopify.</p>
                                </Card.Section>
                                <Card.Section subdued>
                                    <p>Cookies let the app authenticate you by temporarily storing your preferences and personal
    information. They expire after 30 days.</p>
                                </Card.Section>
                            </Card>
                            <Button
                                onClick={this.setCookieAndRedirect}
                                primary
                            >
                                Enable cookies
                            </Button>
                        </Stack>
                    )
                }
                </Page>
            </AppProvider>
        )
    }
}

export default EnableCookies