import React, { Component } from "react"
import PropTypes from "prop-types"
import ShopifyRoutePropagator from "@shopify/react-shopify-app-route-propagator"
import { Link } from "gatsby"
import { Router } from "@reach/router"

class SettingsWrapper extends Component {
    static contextTypes = {
        polaris: PropTypes.object,
    }

    render() {
        console.log(this.context.polaris)

        return (
            <div>
                <ShopifyRoutePropagator location={this.props.location} app={this.context.polaris.appBridge} />
                {/* <Router>
                    <Hi path="/app/hi" />
                    <Bye path="/app/bye" />
                </Router> */}
                settings page
                <Link to="/app/">Go to app home</Link>
            </div>
        )
    }
}

export default SettingsWrapper
