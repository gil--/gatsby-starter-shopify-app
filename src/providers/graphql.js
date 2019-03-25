import React from "react"
import { ApolloClient } from "apollo-client"
import { ApolloProvider } from "react-apollo"
import { ApolloLink } from "apollo-link"
import { createHttpLink } from "apollo-link-http"
import { setContext } from "apollo-link-context"
import { InMemoryCache } from "apollo-cache-inmemory"
import { onError } from "apollo-link-error"
import { navigate } from "gatsby"

import { clearAppCookies } from "../helpers/auth"

const GraphqlProvider = ({ children, shop, token }) => {
    if (typeof window !== 'undefined') {
        const httpLink = createHttpLink({ uri: `/api/graphql` })

        const middlewareLink = setContext(() => ({
            headers: {
                'X-Shopify-Access-Token': token,
                'X-Shopify-Shop-Domain': shop,
            },
        }))

        const errorLink = onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors)
                graphQLErrors.map(({ message, locations, path }) =>
                    console.log(
                        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                    )
                )
            if (networkError) {
                const networkErrorString = `${networkError}`;
                
                if (networkErrorString.includes('401')) {
                    // delete cookies and retry auth as most likely stale token
                    console.warn(`[Network error]: ${networkError}`)
                    
                    clearAppCookies(shop)
                    
                    navigate(
                        `/reauth`,
                        {
                            replace: true,
                        }
                    )
                }
            }
        })

        const client = new ApolloClient({
            link: ApolloLink.from([errorLink, middlewareLink, httpLink]),
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