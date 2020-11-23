const { create, client, Client } = require('@open-wa/wa-automate')
const { color } = require('./utils')
const options = require('./utils/options')
const db = require('better-sqlite3')('database.db')
const msgHandler = require('./handler')

var tempData = new Map()

const start = (client = new Client()) => {
    console.log('[DEV]', color('sProDev', 'yellow'))
    console.log('[CLIENT] CLIENT Started!')

    // Force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[Client State]', state)
        if (state === 'CONFLICT') client.forceRefocus()
    })

    // Set my status (about me)
    client.setMyStatus('JANGAN SPAM STIKER SAYANG :) KETIK "/help" UNTUK MEMULAI. JIKA RESPON BOT LAMBAT, ARTINYA PENGGUNA YG ONLINE DI BOT INI SUDAH LEBIH DARI 50-AN. TUNGGU AUTHOR RESTART BOTNYA, TERIMAKASIH :*')

    // listening on message
    client.onMessage((message) => {
        client.getAmountOfLoadedMessages() // Cut message Cache if cache more than 3K
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[CLIENT]', color(`Loaded Message Reach ${msg}, cuting message cache...`, 'yellow'))
                    client.cutMsgCache()
                }
            })
        // Message Handler
        msgHandler(client, message, db, tempData)
    })

    // listen group invitation
    client.onAddedToGroup(({ groupMetadata: { id }, contact: { name } }) =>
        client.getGroupMembersId(id)
            .then((ids) => {
                console.log('[CLIENT]', color(`Invited to Group. [ ${name} : ${ids.length}]`, 'yellow'))
                client.leaveGroup(id)
            }))
}

create({
    sessionId: "sProDev",
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: false,
    popup: true,
    qrTimeout: 0,
}).then((client) => start(client)).catch((err) => new Error(err))
