import React from "react"

import AppLayout from "./app"

export default ({ children, pageContext }) => {
  if (pageContext.layout === "app") {
    return <AppLayout>{children}</AppLayout>
  }
  return <>{children}</>
}