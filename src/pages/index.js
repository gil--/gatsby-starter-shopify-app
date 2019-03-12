import React, { Component }  from "react"
import { navigate } from "gatsby"
import { AppProvider, Card, Page } from "@shopify/polaris"
class IndexPage extends Component {
  componentDidMount() {
    if (typeof window !== 'undefined') {
      navigate(
        `/app/`,
        {
          state: { 
            params: window.location.search
          },
          replace: true,
        }
      )
    }
  }

  render = () => {
    return (
      <AppProvider
        shopOrigin=""
        apiKey=""
      >
        <Page>
          <Card>
            <Card.Section>
              <p>Authenticating...</p>
            </Card.Section>
          </Card>
        </Page>
      </AppProvider>
    )
  }
}

export default IndexPage
