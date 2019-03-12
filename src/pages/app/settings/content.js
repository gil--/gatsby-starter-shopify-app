import React, { Component } from "react"
import PropTypes from "prop-types"
import ShopifyRoutePropagator from "@shopify/react-shopify-app-route-propagator"
import { Card, Layout, Page, FormLayout, TextField, PageActions } from '@shopify/polaris'

class Content extends Component {
    static contextTypes = {
        polaris: PropTypes.object,
    }

    render() {
        return (
            <div>
                <ShopifyRoutePropagator location={this.props.location} app={this.context.polaris.appBridge} />
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
            </div>
        )
    }
}

export default Content
