import React, { Component } from "react"

import StoreInfo from "../../components/store-info"

class App extends Component {
    render = () => {
        return (
            <StoreInfo location={this.props.location} />
        )
    }
}

export default App
