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
        const shopifyDomain = getShopDomain(shop)

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

const getShopDomain = (shopParam) => {
    const cookies = new Cookies()
    return shopParam || cookies.get('shop')
}

const isAuthValid = ({ shop, token, expiresAt }) => {
    const cookies = new Cookies()

    let cookie = {};
    cookie.shop = cookies.get('shop')
    cookie.token = cookies.get('token')
    cookie.expiresAt = cookies.get('expires_at')

    if (cookie.shop && cookie.token && cookie.expiresAt) {
        return true
    } else if (shop && token && expiresAt) {
        cookies.set('shop', shop, { path: '/' })
        cookies.set('token', token, { path: '/' })
        cookies.set('expires_at', expiresAt, { path: '/' })

        return true
    }

    return false
}