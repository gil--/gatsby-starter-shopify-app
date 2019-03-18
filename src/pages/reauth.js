import React from "react"
import { AppProvider, Page, Button, Card } from "@shopify/polaris";

import {
    refreshAuth
} from "../helpers/auth"

class Reauth extends React.Component {
    componentDidMount = async () => {
        if (typeof window !== 'undefined') {
            const isAuth = await refreshAuth()
        }
    }

    render() {
        return (
            <AppProvider
                shopOrigin={''}
                apiKey={''}
                forceRedirect={(process.env.NODE_ENV === 'development') ? false : true}
            >
                <Page title="Authenticating...">
                    <Card>
                        <Card.Section>
                            <p>Please wait while we authenticate with Shopify...</p>
                        </Card.Section>
                    </Card>
                </Page>
            </AppProvider>
        )
    }
}

export default Reauth