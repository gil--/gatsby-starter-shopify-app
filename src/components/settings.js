import React, { Component } from "react"
import PropTypes from "prop-types"
import ShopifyRoutePropagator from "@shopify/react-shopify-app-route-propagator"
import { Button, Heading, Layout, Page } from '@shopify/polaris'
import { Router } from "@reach/router"

class SettingsWrapper extends Component {
    static contextTypes = {
        polaris: PropTypes.object,
    }

    render() {
        return (
            <div>
                <ShopifyRoutePropagator location={this.props.location} app={this.context.polaris.appBridge} />
                {/* <Router>
                    <Hi path="/app/hi" />
                    <Bye path="/app/bye" />
                </Router> */}
                <Page
                    title="Settings"
                >
                    <Layout>
                        <Layout.Section>
                            <Heading>Settings Page</Heading>
                            <Button url="/app">Go to app home</Button>
                        </Layout.Section>
                    </Layout>
                </Page>
            </div>
        )
    }
}

export default SettingsWrapper
