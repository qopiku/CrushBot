const { create, Client } = require('@open-wa/wa-automate')
let map = new Map()

const pesan = `Halo, apa kabar? Semoga kamu sedang dalam keadaan yang baik-baik saja yaa..\n\nMau ngasih kabar duka hehe, CrushBot mau pamit dulu, gatau nanti bakal balik lagi apa engga\n\n*Loh pamit kenapa?*\n\nSelain saya (author) yang engga ada dana buat perpanjangan server (karena engga ada donasi masuk, dan jika terus mengandalkan uang tabungan, pastinya akan sangat _nelongso_) saya juga cape ngebenerin bug yang setiap hari muncul mulu :) ditambah anonim anonim yang kalo udah ketemu sama partnernya cuma diem ditempat alias engga pernah next lagi (akibatnya kalian kehabisan partner), itu ngebuat saya kehilangan jiwa-jiwa untuk bersemangat.\n\nAlesan diatas mungkin udah sangat cukup haha.\n\n*FYI*\n\nCrushBot pertama kali diluncurkan pada tanggal 26 Oktober 2020, sempat mati dalam beberapa bulan karena saya sedang menjalankan tugas (lomba), dan akhirnya CrushBot kembali bangkit pada tanggal 28 Desember 2020. Namun sayang sekali, akhirnya CrushBot tumbang lagi di tanggal 8 Januari 2021 ini :)\n\nTerimakasih untuk kalian semua yang sudah mau berpastisipasi dalam meramaikan bot yang saya buat.\n\nByee :3\n\n_selanjutnya, akun whatsapp ini adalah akun whatsapp biasa (bukan bot), jadi semua pesan yang kalian kirim bisa saja dibaca dan dibalas oleh author_`

const broadcast = (client = new Client()) => {
    console.log('')
    console.log('[DEV] sProDev')
    console.log('[CLIENT] Client Started!')
    console.log('')

    // updating bot informations
    client.setPresence(false)
    client.setMyName('CrushBot')
    client.setMyStatus('CrushBot sudah tidak aktif ya bund :)')

    // force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[STATE]', state)
        if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus()
    })

    client.getAllChats().then((chats) => {
        chats.forEach((chat) => {
            setTimeout(() => {
                client.sendText(chat.id, pesan)
                    .then(() => {
                        map.set(chat.id, 'udah')
                    })
            }, 1500)
        })
    })

    // listening on message
    client.onMessage((message) => {
        // cut message cache if cache more than 3K
        client.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && client.cutMsgCache())

        // message handler
        udah = map.get(message.id)
        if (udah != undefined && udah == 'udah') {
            client.reply(message.from, 'Terimakasih selalu ada :)', message.id)
        }
    })

    // get all groups
    client.getAllGroups().then((groups) => {
        groups.forEach((group) => {
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

const options = {
    sessionId: 'sProDev',
    headless: true,
    qrTimeout: 0,
    authTimeout: 0,
    restartOnCrash: broadcast,
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
    .then((client) => broadcast(client))
    .catch((err) => new Error(err))