import Cookies from "universal-cookie"
import axios from "axios"
import { navigate } from "gatsby"

const TEST_COOKIE_NAME = 'shopify.cookies_persist';

export const isAuthenticated = async (urlParamString) => {
    console.log(window.location)

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
    let parentDomain = document.location.ancestorOrigins && document.location.ancestorOrigins[0] // if chrome iframe
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

    if (!hasCookieAccess(shop)) {
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

const hasCookieAccess = (shop) => {
    if (shouldRequestStorage())  {
        // redirect to enable_cookie
        const redirectUrl = `${window.location.origin}/enable-cookies?shop=https://${shop}`

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
        return false
    }

    return true
}

const shouldRequestStorage = () => {
    const cookies = new Cookies()

    if (cookies.get(TEST_COOKIE_NAME)) {
        return false
    }

    if (isShopifyiOS()) {
        return false
    }

    if (window.top === window.self) {
        return false
    }

    // if (userAgentCanPartitionCookies()) {
    //     return false
    // }

    if (!navigator.userAgent.match(/Safari/)) {
        return false
    }

    if (navigator.userAgent.match(/Chrome/)) {
        return false
    }

    return !cookies.get(TEST_COOKIE_NAME);
}

const isShopifyiOS = () => {
    if (navigator.userAgent.indexOf('com.jadedpixel.pos') !== -1) {
        return true
    }

    if (navigator.userAgent.indexOf('Shopify Mobile/iOS') !== -1) {
        return true
    }

    return false
}

const userAgentCanPartitionCookies = () => {
    if (isShopifyiOS()) {
        return false
    }

    return navigator.userAgent.match(/Version\/12\.0\.?\d? Safari/)
}
