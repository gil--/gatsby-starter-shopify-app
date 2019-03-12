import React, { Component } from "react"
import PropTypes from "prop-types"
import ShopifyRoutePropagator from "@shopify/react-shopify-app-route-propagator"
//import { Router } from "@reach/router"
import gql from "graphql-tag"
import { Query } from "react-apollo"
import { Button, Card, Heading, Layout, Page, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris"

//import Settings from "./settings"

const GET_SHOP_INFO = gql`
    query shopInfo {
        shop {
            id
            name
            description
            email
            myshopifyDomain
            plan {
                displayName
            }
        }
    }
`

class StoreInfo extends Component {
    static contextTypes = {
        polaris: PropTypes.object,
    }

    render() {
        return (
            <div>
                <ShopifyRoutePropagator location={this.props.location} app={this.context.polaris.appBridge} />
                <Query query={GET_SHOP_INFO}>
                    {({ loading, error, data }) => {
                        const shop = data && data.shop
                        // TODO: pass page title for <Page> component in layout to page layout context API
                        return (
                            <Layout>
                                <Layout.Section>
                                    <Heading>
                                    {
                                        loading || !shop
                                            ? <SkeletonDisplayText size="small" />
                                            : shop.name
                                    }
                                    </Heading>
                                    {
                                        loading || !shop
                                            ? null
                                            : <p>{shop.description}</p>
                                    }
                                </Layout.Section>
                                <Layout.Section>
                                    <Card>
                                        <Card.Section title="Store Domain">
                                        {
                                            loading || !shop
                                                ? <SkeletonBodyText />
                                                : <p>{shop.myshopifyDomain}</p>
                                        }
                                        </Card.Section>
                                        <Card.Section title="Store Email">
                                        {   loading || !shop
                                                ? <SkeletonBodyText />
                                                : <p>{shop.email}</p>
                                        }
                                        </Card.Section>
                                        <Card.Section title="Shopify Plan">
                                        {   loading || !shop
                                                ? <SkeletonBodyText />
                                                : <p>{shop.plan.displayName}</p>
                                        }
                                        </Card.Section>
                                    </Card>
                                </Layout.Section>
                                <Layout.Section>
                                    <Button url="/app/settings/">Go to settings</Button>
                                </Layout.Section>
                            </Layout>
                        )
                    }}
                </Query>
                {/* <Router>
                    <Settings path="/app/settings" />
                </Router> */}
            </div>
        )
    }
}

export default StoreInfo
