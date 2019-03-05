import React, { Component } from "react"

import { isAuthenticated } from "../../helpers/auth"
import Layout from "../../components/layout"

import Welcome from "../../components/welcome"


class App extends Component {
    async componentDidMount() {
        console.log('hi!')
        isAuthenticated()
    }

    render = () => {
        return (
            <Layout>
                <Welcome location={this.props.location} />
            </Layout>
        )
    }
}

export default App
