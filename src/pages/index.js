import React, { Component }  from "react"
import { StaticQuery, graphql, Link, navigate } from "gatsby"
import { AppProvider } from "@shopify/polaris"
import PropTypes from "prop-types"

import { isAuthenticated } from "../helpers/auth"
import Layout from "../components/layout"

import Welcome from "../components/welcome"
import Header from "../components/header"
import GraphqlProvider from "../providers/graphql"

const CustomLinkComponent = ({ children, url, external, ...rest }) => {
  if (external) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      to={url}
      {...rest}
    >
      {children}
    </Link>
  )
}

class IndexPage extends Component {
  async componentDidMount() {
    console.log('hi!')
    if (isAuthenticated()) {
      navigate("/app/")
    }
  }
  
  render = () => {
    // TODO: use cookies
    const shop = "gatsbyjs.myshopify.com"
    const token = "123"

    return (
      <Link to="/app/">Go to app</Link>
    )
  }
}

export default IndexPage
