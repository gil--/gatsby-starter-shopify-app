import React, { Component } from "react"

import SettingsWrapper from "../../components/settings"

class Settings extends Component {
    render = () => {
        return (
            <SettingsWrapper location={this.props.location} />
        )
    }
}

export default Settings
