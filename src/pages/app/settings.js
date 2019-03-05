import React, { Component } from "react"
import { isAuthenticated } from "../../helpers/auth"
import Layout from "../../components/layout"

import SettingsWrapper from "../../components/settings"

class Settings extends Component {
    async componentDidMount() {
        console.log('hi!')
        isAuthenticated()
    }

    render = () => {
        return (
            <Layout>
                <SettingsWrapper location={this.props.location} />
            </Layout>
        )
    }
}

export default Settings
