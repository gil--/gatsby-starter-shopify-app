import React, { Component } from "react"
import PropTypes from "prop-types"
import ShopifyRoutePropagator from "@shopify/react-shopify-app-route-propagator"
import { Button, Card, Layout, Page, FormLayout, TextField, PageActions } from '@shopify/polaris'
import { Router } from "@reach/router"

class Content extends Component {
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
                        <Layout.AnnotatedSection
                            title="App Settings"
                            description="Shopify and your customers will use this information to contact you."
                        >
                            <Card sectioned>
                                <FormLayout>
                                    <TextField label="Store name" onChange={() => { }} />
                                    <TextField type="email" label="Account email" onChange={() => { }} />
                                </FormLayout>
                            </Card>
                        </Layout.AnnotatedSection>
                        <Layout.Section>
                            <PageActions
                                primaryAction={{
                                    content: 'Save',
                                }}
                                secondaryActions={[
                                    {
                                        content: 'Back',
                                        url: '/app',
                                    },
                                ]}
                            />
                        </Layout.Section>
                    </Layout>
                </Page>
            </div>
        )
    }
}

export default Content
