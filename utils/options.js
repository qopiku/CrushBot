const fs = require('fs')
const path = require('path');
// the browser path
const path = path.resolve('/opt/google/chrome/google-chrome')

module.exports = options = (headless, start) => {
    const options = {
        executablePath: path,
        headless: headless,
        qrRefreshS: 20,
        qrTimeout: 0,
        authTimeout: 0,
        autoRefresh: true,
        restartOnCrash: start,
        cacheEnabled: false,
        // executablePath: execPath,
        useChrome: true,
        killProcessOnBrowserClose: true,
        throwErrorOnTosBlock: false,
        chromiumArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disk-cache-size=0'
        ]
    }

    return options
}
