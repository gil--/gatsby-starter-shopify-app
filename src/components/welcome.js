import React, { Component } from "react"
import PropTypes from "prop-types"
import ShopifyRoutePropagator from "@shopify/react-shopify-app-route-propagator"
import { Link } from "gatsby"
import { Router } from "@reach/router"

class Welcome extends Component {
    static contextTypes = {
        polaris: PropTypes.object,
    }

    render() {
        return (
            <div>
                <ShopifyRoutePropagator location={this.props.location} app={this.context.polaris.appBridge} />
                {/* <Router>
                    <Hi path="/app/hi" />
                    <Bye path="/app/bye" />
                </Router> */}
                <h2>app home</h2>
                <Link to="/app/settings/">Go to settings</Link>
            </div>
        )
    }
}

export default Welcome
