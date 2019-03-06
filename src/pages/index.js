import React, { Component }  from "react"
import { Link, navigate } from "gatsby"

import { isAuthenticated } from "../helpers/auth"

class IndexPage extends Component {
  async componentDidMount() {
    if (isAuthenticated()) {
      navigate("/app/")
    }
  }
  
  render = () => {
    return (
      <Link to="/app/">Go to app</Link>
    )
  }
}

export default IndexPage
