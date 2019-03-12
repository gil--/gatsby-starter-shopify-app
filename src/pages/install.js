import React from "react"
import { AppProvider, Banner, Button, Card, DisplayText, Form, FormLayout, Layout, Page, TextField } from "@shopify/polaris";
//import styled from 'styled-components'
import axios from "axios"

class Install extends React.Component {
    state = {
        shop: '',
        missingShop: false,
        hasError: false,
        isLoading: false,
    }

    componentDidMount() {
        const queryParams = window.location.search
        const urlParams = new URLSearchParams(queryParams)
        const shop = urlParams.get('shop')

        if (shop) {
            const shopName = shop.replace('.myshopify.com', '');
            this.setState({ shop: shopName })
        }
    }

    handleChange = (field) => {
        return (value) => this.setState({ [field]: value })
    }

    onSubmit = (event) => {
        this.setState({
            missingShop: false,
            isLoading: true,
            hasError: false,
        })

        if (this.state.shop.length > 0) {
            axios.post('/auth', {
                shop: this.state.shop,
            })
                .then(response => {
                    if (response.data && response.data) {
                        const redirectUrl = response.data.body

                        if (window.top === window.self) {
                            window.top.location.href = redirectUrl
                        } else {
                            let normalizedLink = document.createElement('a')
                            normalizedLink.href = redirectUrl

                            const message = JSON.stringify({
                                message: "Shopify.API.remoteRedirect",
                                data: { location: normalizedLink.href }
                            });
                            window.parent.postMessage(message, `https://${this.state.shop}.myshopify.com`);
                        }
                        return;
                    } else {
                        this.setState({
                            hasError: true,
                            isLoading: false,
                        })
                        return;
                    }
                })
                .catch(error => {
                    this.setState({
                        hasError: error,
                        isLoading: false,
                    })
                })
        } else {
            this.setState({
                missingShop: true,
                hasError: 'Missing shop parameter.',
                isLoading: false,
            })
        }
    }

    render() {
        const { shop, hasError, isLoading, missingShop } = this.state
        const appName = 'App'

        return (
            <AppProvider
                shopOrigin=""
                apiKey=""
            >
                <Page title={`Install ${appName}`}>
                    <Layout>
                        <Layout.Section>
                            {/* <InstallWrapper> */}
                                {
                                    hasError &&
                                    (
                                        // <Notices>
                                            <Banner
                                                title="There was an error."
                                                status="critical"
                                            >
                                                {hasError}
                                            </Banner>
                                        // </Notices>
                                    )
                                }
                                <Card sectioned>
                                    <DisplayText size="large">{appName}</DisplayText>
                                    <br />
                                    <Form method="POST" onSubmit={this.onSubmit}>
                                        <FormLayout>
                                            <TextField
                                                id="shop"
                                                name="shop"
                                                value={shop}
                                                onChange={this.handleChange('shop')}
                                                label="Shop Domain"
                                                type="text"
                                                placeholder="example"
                                                prefix="https://"
                                                suffix=".myshopify.com"
                                                error={missingShop && 'Shop domain is required'}
                                                helpText={
                                                    <span>Enter your shop domain to log in or install this app.</span>
                                                }
                                                required=""
                                            />
                                            <Button primary submit loading={isLoading}>Install {appName}</Button>
                                        </FormLayout>
                                    </Form>
                                </Card>
                            {/* </InstallWrapper> */}
                        </Layout.Section>
                    </Layout>
                </Page>
            </AppProvider>
        )
    }
}

export default Install

// const InstallWrapper = styled.div`
//     max-width: 450px;
//     margin-left: auto;
//     margin-right: auto;
// `

// const Notices = styled.div`
//     margin-bottom: 2rem;
// `