import Cookies from "universal-cookie"
import axios from "axios"

export const isAuthenticated = () => {
    const queryParams = window.location.search
    const urlParams = new URLSearchParams(queryParams)
    const shop = urlParams.get('shop')
    const token = urlParams.get('token')
    const expiresAt = urlParams.get('expires_at')

    if (isAuthValid({ shop, token, expiresAt })) {
        return true
    } else {
        const shopifyDomain = getShopDomain()

        if (!shopifyDomain) {
            // TODO: redirect to install page
            throw "No Shop domain"
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
                throw "Invalid /auth API response";
            }
        })
        .catch(error => {
            console.log(error)
            return false
        })
    }
}

export const getShopDomain = () => {
    const queryParams = window.location.search
    const urlParams = new URLSearchParams(queryParams)
    const shopDomain = urlParams.get('shop')
    const cookies = new Cookies()
    return shopDomain || cookies.get(`shop`)
}

export const getShopToken = () => {
    const shopDomain = getShopDomain()
    const cookies = new Cookies()
    return cookies.get(`token_${shopDomain}`)
}

const isAuthValid = ({ shop, token, expiresAt }) => {
    const shopDomain = getShopDomain()
    const cookies = new Cookies()

    let cookie = {};
    cookie.shop = cookies.get(`shop`)
    cookie.token = cookies.get(`token_${shopDomain}`)
    cookie.expiresAt = cookies.get(`expires_at_${shopDomain}`)

    if (cookie.shop && cookie.token && cookie.expiresAt) {
        return true
    } else if (shop && token && expiresAt) {
        const expirationDate = new Date()
        expirationDate.setTime(expirationDate.getTime() + (24 * 60 * 60 * 1000))

        cookies.set(`shop`, shop, { path: '/', expires: expirationDate, })
        cookies.set(`token_${shopDomain}`, token, { path: '/', expires: expirationDate, })
        cookies.set(`expires_at_${shopDomain}`, expiresAt, { path: '/', expires: expirationDate, })

        return true
    }

    return false
}