import React, { Component }  from "react"
import { navigate } from "gatsby"
import { Card, Layout, Page } from "@shopify/polaris"

class IndexPage extends Component {
  componentDidMount = async () => {
    if (typeof window !== 'undefined') {
      navigate(
        `/app/`,
        {
          replace: true,
        }
      )
    }
  }

  render = () => {
    return (
      <Page
        title="Authenticating..."
      >
        <Layout>
          <Layout.Section>
            <Card>
              <Card.Section>
                <p>Authenticating...</p>
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    )
  }
}

export default IndexPage
