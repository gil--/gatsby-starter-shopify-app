import React from "react"
import { ApolloClient } from "apollo-client"
import { ApolloProvider } from "react-apollo"
import { createHttpLink } from "apollo-link-http"
import { setContext } from "apollo-link-context"
import { InMemoryCache } from "apollo-cache-inmemory"

const GraphqlProvider = ({ children, shop, token }) => {
    if (typeof window !== 'undefined') {
        const httpLink = createHttpLink({ uri: `/graphql` })

        const middlewareLink = setContext(() => ({
            headers: {
                'X-Shopify-Access-Token': token,
                'X-Shopify-Shop-Domain': shop,
            },
        }))

        const client = new ApolloClient({
            link: middlewareLink.concat(httpLink),
            cache: new InMemoryCache(),
        })

        return (
            <ApolloProvider client={client}>
                {children}
            </ApolloProvider>
        )
    } else {
        return (
            <>
                {children}
            </>
        )
    }
}

export default GraphqlProvider