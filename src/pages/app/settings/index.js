import React, { Component } from "react"

import Content from "./content"

class Settings extends Component {
    render = () => {
        return (
            <Content location={this.props.location} />
        )
    }
}

export default Settings
