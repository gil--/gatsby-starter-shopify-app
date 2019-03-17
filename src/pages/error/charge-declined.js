import React from "react"
import { navigate } from "gatsby"
import { AppProvider, Layout, Page, Banner, ButtonGroup, Button, Card } from "@shopify/polaris";
//import styled from 'styled-components'

class ChargeDeclined extends React.Component {
    handleInstall = () => {
        navigate(
            `/install/`,
            {
                replace: true,
            }
        )
    }

    render() {
        return (
            <AppProvider
                shopOrigin=""
                apiKey=""
            >
                <Page title={`Charge Declined`}>
                    <Layout>
                        <Layout.Section>
                            <Banner
                                title="There was an error installing app."
                                status="critical"
                            >
                                Error: Unable to activate application charge.
                            </Banner>
                            <Card sectioned>
                                <ButtonGroup>
                                    <Button url="/help">Get Help</Button>
                                    <Button primary onClick={this.handleInstall}>Re-Install</Button>
                                </ButtonGroup>
                            </Card>
                        </Layout.Section>
                    </Layout>
                </Page>
            </AppProvider>
        )
    }
}

export default ChargeDeclined