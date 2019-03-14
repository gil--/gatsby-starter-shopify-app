import React, { Component } from "react"
import { Page } from "@shopify/polaris"

import Content from "./content"

class Settings extends Component {
    render = () => {
        return (
            <Page 
                title="Settings"
                primaryAction={{ 
                    content: 'Save', 
                    disabled: true,
                }}
            >
                <Content location={this.props.location} />
            </Page>
        )
    }
}

export default Settings
