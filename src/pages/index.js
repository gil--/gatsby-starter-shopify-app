import React, { Component }  from "react"
import { Link } from "gatsby"

class IndexPage extends Component {
  render = () => {
    return (
      <Link to="/app">Go to app</Link>
    )
  }
}

export default IndexPage
