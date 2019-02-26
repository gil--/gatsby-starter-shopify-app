import React, { Component }  from "react"
import { Link } from "gatsby"

import { isAuthenticated } from "../helpers/auth"
import Layout from "../components/layout"

class IndexPage extends Component {
  async componentDidMount() {
    console.log('hi')
    isAuthenticated()
  }

  render = () => {
    return (
      <Layout>
        <Link to="/page-2/">Go to page 2</Link>
      </Layout>
    )
  }
}

export default IndexPage
