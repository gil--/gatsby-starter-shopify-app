import Cookies from "universal-cookie"
import axios from "axios"
import { navigate } from "gatsby"

export const isAuthenticated = async (urlParamString) => {
    const cookies = new Cookies()

    const queryParams = urlParamString 
                        || window.location.search 
                        || cookies.get('hmac_query')
    const urlParams = new URLSearchParams(queryParams)
    const shop = urlParams.get('shop')
    const token = urlParams.get('token')
    const expiresAt = urlParams.get('expires_at')

    if (isAuthValid({ token, expiresAt })) {
        return true
    } else {
        const shopifyDomain = shop || getShopDomain()

        if (!shopifyDomain) {
            navigate('/install')
            return false
            //throw "No Shop domain"
        }

        return await refreshAuth(shopifyDomain)
    }

    return false
}

export const getShopDomain = () => {
    const cookies = new Cookies()
    const queryParams = window.location.search || cookies.get(`hmac_query`)
    const urlParams = new URLSearchParams(queryParams)
    let parentDomain = document.location.ancestorOrigins[0] // if iframe
    const shopDomain = urlParams.get('shop')

    if (typeof parentDomain !== 'undefined') {
        parentDomain = parentDomain.replace('https://', '')
    }

    return shopDomain || parentDomain
}

export const getShopToken = (domain) => {
    const shopDomain = domain || getShopDomain()
    const cookies = new Cookies()
    return cookies.get(`token_${shopDomain}`)
}

const isAuthValid = ({ token, expiresAt }) => {
    const shopDomain = getShopDomain()
    const cookies = new Cookies()
    const cookie = {
        token: cookies.get(`token_${shopDomain}`),
        expiresAt: cookies.get(`expires_at_${shopDomain}`),
    }

    if (cookie.token && cookie.expiresAt) {
        return true
    } else if (token && expiresAt) {
        const expirationDate = new Date()
        expirationDate.setTime(expirationDate.getTime() + (24 * 60 * 60 * 1000))

        cookies.set(`token_${shopDomain}`, token, { path: '/', expires: expirationDate, })
        cookies.set(`expires_at_${shopDomain}`, expiresAt, { path: '/', expires: expirationDate, })
        removeHmacQueryCookie()

        return { shopDomain }
    }

    return false
}

export const clearAppCookies = (shop) => {
    const cookies = new Cookies()
    
    cookies.remove(`token_${shop}`)
    cookies.remove(`expires_at_${shop}`)

    return true
}

export const setHmacQueryCookie = (query) => {
    const cookies = new Cookies()
    const expirationDate = new Date()
    expirationDate.setTime(expirationDate.getTime() + (5 * 60 * 1000)) // 5 minutes

    cookies.set(`hmac_query`, query, { path: '/', expires: expirationDate, })
}

export const removeHmacQueryCookie = () => {
    const cookies = new Cookies()
    cookies.remove(`hmac_query`)
}

export const refreshAuth = (shopDomain) => {
    const shop = shopDomain || getShopDomain()

    if (!shop) {
        return false
    }

    return axios.post('/auth', {
        shop,
    })
        .then(response => {
            if (response.data && response.data.body) {
                const redirectUrl = response.data.body

                if (window.top === window.self) {
                    window.top.location.href = redirectUrl
                } else {
                    let normalizedLink = document.createElement('a')
                    normalizedLink.href = redirectUrl

                    const message = JSON.stringify({
                        message: "Shopify.API.remoteRedirect",
                        data: { location: normalizedLink.href }
                    });
                    window.parent.postMessage(message, `https://${shop}`)
                }
            } else {
                throw new Error("Invalid /auth API response")
            }
        })
        .catch(error => {
            console.warn(error)
            return false
        })
}