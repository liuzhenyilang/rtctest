export default function () {
    let ua = window.navigator.userAgent
    let isWindowsPhone = /(?:Windows Phone)/.test(ua)
    let isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone
    let isAndroid = /(?:Android)/.test(ua)
    let isFireFox = /(?:Firefox)/.test(ua)
    let isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua))
    let isPhone = /(?:iPhone)/.test(ua) && !isTablet
    if (isSymbian || isAndroid || isTablet || isPhone) {
        return true
    }
    return false
}