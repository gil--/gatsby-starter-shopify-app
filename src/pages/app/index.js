import React, { Component } from "react"
import { Layout, Page } from "@shopify/polaris"

import StoreInfo from "./store-info"

class App extends Component {
    render = () => {
        return (
            <Page
                title="Home"
            >
                <Layout>
                    <Layout.Section>
                        <StoreInfo location={this.props.location} />
                    </Layout.Section>
                </Layout>
            </Page>
        )
    }
}

export default App
