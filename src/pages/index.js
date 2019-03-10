import React, { Component }  from "react"
import { Link, navigate } from "gatsby"

class IndexPage extends Component {
  componentDidMount() {
    if (typeof window !== 'undefined') {
      navigate(
        `/app/`,
        {
          state: { 
            params: window.location.search
          },
          replace: true,
        }
      )
    }
  }

  render = () => {
    return (
      <>
        <p>Authenticating...</p>
      </>
    )
  }
}

export default IndexPage
