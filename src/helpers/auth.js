import Cookies from "universal-cookie"
import axios from "axios"
import { navigate } from "gatsby"

export const isAuthenticated = (urlParamString) => {
    const queryParams = urlParamString || window.location.search
    const urlParams = new URLSearchParams(queryParams)
    const shop = urlParams.get('shop')
    const token = urlParams.get('token')
    const expiresAt = urlParams.get('expires_at')

    if (isAuthValid({ token, expiresAt })) {
        return { shop }
    } else {
        const shopifyDomain = shop || getShopDomain()

        if (!shopifyDomain) {
            navigate('/install')
            return false
            //throw "No Shop domain"
        }

        axios.post('/auth', {
            shop: shopifyDomain,
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
                    window.parent.postMessage(message, `https://${shopifyDomain}`)
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

    return false
}

export const getShopDomain = () => {
    const queryParams = window.location.search
    const urlParams = new URLSearchParams(queryParams)
    let parentDomain = document.location.ancestorOrigins[0] // if iframe
    const shopDomain = urlParams.get('shop')
    const cookies = new Cookies()
    
    if (typeof parentDomain !== 'undefined') {
        parentDomain = parentDomain.replace('https://', '')
    }

    return shopDomain || cookies.get(`shop_${shopDomain}`) || parentDomain
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

        return { shopDomain }
    }

    return false
}