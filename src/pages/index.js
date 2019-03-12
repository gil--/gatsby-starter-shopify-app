import React, { Component }  from "react"
import { navigate } from "gatsby"
import { AppProvider, Card, Page } from "@shopify/polaris"

import { isAuthenticated } from "../helpers/auth"

class IndexPage extends Component {
  componentDidMount = async () => {
    if (typeof window !== 'undefined') {
      const { shop } = await isAuthenticated()
      
      navigate(
        `/app/`,
        {
          state: { 
            params: window.location.search,
            shopDomain: shop,
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
        forceRedirect={(process.env.NODE_ENV === 'development') ? false : true}
      >
        <Page title="Authenticating...">
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
