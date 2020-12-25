// require('dotenv').config({ path: __dirname + '/../.env' })
const { create, Client } = require('@open-wa/wa-automate')
const { color, logging } = require('./utils')
const handler = require('./handler')

var connection, tempdata

const crush = (client = new Client()) => {
    console.log('[DEV]', color('sProDev', 'yellow'))
    console.log('[CLIENT] Client Started!')

    // updating bot informations
    client.setPresence(false)
    if (process.env.BOT_NAME) {
        client.setMyName(process.env.BOT_NAME)
    }
    if (process.env.BOT_STATUS) {
        client.setMyStatus(process.env.BOT_STATUS)
    }

    // message log for analytic
    client.onAnyMessage((fn) => logging(fn.fromMe, fn.type))

    // force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[Client State]', state)
        if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus()
    })

    // listening on message
    client.onMessage((message) => {
        // cut message cache if cache more than 3K
        client.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && client.cutMsgCache())
        // message handler
        handler(client, message, connection, tempdata)
    })

    // get all groups
    client.getAllGroups().then(async (groups) => {
        await groups.forEach((group) => {
            client.leaveGroup(group.id)
        })
    })

    // listen group invitation
    client.onAddedToGroup(({ groupMetadata: { id } }) => {
        client.getGroupMembersId(id)
            .then(() => {
                client.leaveGroup(id)
            })
    })
}

const start = (conn, temp) => {
    connection = conn
    tempdata = temp

    const options = {
        sessionId: 'sProDev',
        headless: true,
        qrTimeout: 0,
        authTimeout: 0,
        restartOnCrash: crush,
        cacheEnabled: false,
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

    create(options)
        .then((client) => crush(client))
        .catch((err) => new Error(err))
}

module.exports = {
    start
}