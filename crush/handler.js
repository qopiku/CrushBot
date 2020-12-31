const { decryptMedia } = require('@open-wa/wa-automate')
const { color, processTime } = require('./utils')
const mime = require('mime-types')
const fs = require('fs').promises
const webp = require('webp-converter')
const query = require('./rethink/index')
const text = require('./text')

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

var Filter = require('bad-words'),
    // add words to the blacklist
    filter = new Filter({ list: ['anjing', 'babi', 'kunyuk', 'bajingan', 'asu', 'bangsat', 'kampret', 'kontol', 'memek', 'ngentot', 'pentil', 'perek', 'pepek', 'pecun', 'bencong', 'banci', 'maho', 'gila', 'sinting', 'tolol', 'sarap', 'lonte', 'hencet', 'taptei', 'kampang', 'pilat', 'keparat', 'bejad', 'gembel', 'brengsek', 'tai', 'anjrit', 'bangsat', 'fuck', 'tete', 'tetek', 'ngulum', 'jembut', 'totong', 'kolop', 'puki', 'pukimak', 'bodat', 'heang', 'jancuk', 'burit', 'titit', 'nenen', 'bejat', 'silit', 'sempak', 'fucking', 'asshole', 'bitch', 'penis', 'vagina', 'klitoris', 'kelentit', 'borjong', 'dancuk', 'pantek', 'taek', 'itil', 'teho', 'bejat', 'bagudung', 'babami', 'kanciang', 'bungul', 'idiot', 'kimak', 'henceut', 'kacuk', 'blowjob', 'pussy', 'dick', 'damn', 'ass'] })

const suffix = {
    notreg: '_notRegistered',
    nopart: '_noPartner',
    search: '_search'
}

module.exports = handler = async (client, message, connection, tempdata) => {
    try {
        const { type, from, t, sender, isGroupMsg, caption, mimetype } = message
        let { body } = message
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName

        body = (type === 'chat') ? message.body : ((type === 'image' && caption)) ? caption : ''
        const uaOverride = "WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"

        // ignore chat from groups
        if (isGroupMsg) return

        // public commands
        switch (body.toLowerCase()) {
            case '/start':
                return await query.insert(connection, from, pushname)
                    .then(async () => {
                        await client.sendText(from, text.start())
                    })
                    .catch(err => console.error(color('[ERROR]', 'red'), err))
                break

            case '/speed':
            case '/ping':
                return await client.sendText(from, `Pong!!!\nKecepatan proses: ${processTime(t, moment())} detik.`)
                break

            case '/help':
                return await client.sendText(from, text.help())
                break

            case '/about':
                var loadedMsg = await client.getAmountOfLoadedMessages(),
                    chatIds = await client.getAllChatIds(),
                    groups = await client.getAllGroups()

                return await client.sendText(from, text.about({
                    chatroom: (chatIds.length - groups.length),
                    messages: loadedMsg
                }))
                break

            case '/donate':
                return await client.sendText(from, text.donate())
                break

            default:
                break
        }

        // registered client commands
        await query.retrieve(connection, from)
            .then(async (people) => {
                if (people.length) {
                    const anon = people[0]
                    const mapkey = from + suffix.nopart

                    switch (body.toLowerCase()) {
                        case '/search':
                            if (anon.partner && anon.partner !== null) {
                                await client.sendText(from, `Sekarang kamu sedang dalam percakapan🤔\n*/next* — Temukan partner baru\n*/stop* — Hentikan percakapan ini`)
                            } else {
                                if (searching(from, tempdata)) {
                                    console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color('+' + from.replace('@c.us', '')), 'looking for partner')

                                    searchPartner(client, message, connection, tempdata)
                                }
                            }
                            break

                        case '/next':
                            var rowdata, updatedata
                            if (anon.partner && anon.partner !== null) {
                                rowdata = [
                                    { contact: anon.partner },
                                    { contact: from }
                                ]
                                updatedata = [
                                    { partner: null, status: 0 },
                                    { partner: null, status: 0 }
                                ]
                            } else {
                                rowdata = [
                                    { contact: from }
                                ]
                                updatedata = [
                                    { partner: null, status: 0 }
                                ]
                            }

                            await query.multiple(connection, rowdata, updatedata)
                                .then(async () => {
                                    if (anon.partner && anon.partner !== null) {
                                        await client.sendText(anon.partner, `Partner kamu telah menghentikan percakapan😔\nKetik */search* untuk menemukan partner baru`)
                                    }

                                    if (searching(from, tempdata)) {
                                        console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color('+' + from.replace('@c.us', '')), 'skipped conversation')

                                        searchPartner(client, message, connection, tempdata)
                                    }
                                })
                                .catch(err => console.error(color('[ERROR]', 'red'), err))
                            break

                        case '/stop':
                            if (searching(from, tempdata)) {
                                if (anon.partner && anon.partner !== null) {
                                    console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color('+' + from.replace('@c.us', '')), 'terminated conversation')

                                    tempdata.set(mapkey, false)

                                    await query.update(connection, { contact: anon.partner }, { partner: null, status: 0 })
                                        .then(async () => {
                                            await client.sendText(anon.partner, `Partner kamu telah menghentikan percakapan😔\nKetik */search* untuk menemukan partner baru`)
                                        })
                                        .catch(err => console.log(color('[ERROR]', 'red'), err))

                                    await query.update(connection, { contact: from }, { partner: null, status: 0 })
                                        .then(async () => {
                                            await client.sendText(from, `Kamu menghentikan percakapan🙄\nKetik */search* untuk menemukan partner baru`)
                                        })
                                        .catch(err => console.log(color('[ERROR]', 'red'), err))
                                } else {
                                    await client.sendText(from, `Kamu belum memiliki partner🤔\nKetik */search* untuk menemukan partner`)
                                }
                            }
                            break

                        case '/sharecontact':
                            if (searching(from, tempdata)) {
                                if (anon.partner && anon.partner !== null) {
                                    console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Share contact from', color('+' + from.replace('@c.us', '')), 'to', color('+' + anon.partner.replace('@c.us', '')))

                                    await client.sendContact(anon.partner, from)
                                    await client.sendText(from, `Kontak WhatsApp kamu telah dikirim ke partner`)
                                } else {
                                    await client.sendText(from, `Kamu belum memiliki partner🤔\nKetik */search* untuk menemukan partner`)
                                }
                            }
                            break

                        default:
                            if (anon.partner && anon.partner !== null) {
                                tempdata.set(mapkey, false)
                                var filename, mediaData, imageBase64

                                switch (type) {
                                    case 'audio':
                                        await client.sendText(from, `*INFORMASI*\n\nFile audio belum support pada WhatsApp Bot ini, artinya audio yang kamu kirim tidak sampai ke partner`)
                                        break

                                    case 'vcard':
                                        await client.sendText(from, `*INFORMASI*\n\nVCard belum support pada WhatsApp Bot ini, artinya kontak yang kamu kirim tidak sampai ke partner\n\nKamu bisa menggunakan perintah */sharecontact* untuk membagikan kontak WhatsApp kamu ke partner`)
                                        break

                                    case 'multi_vcard':
                                        await client.sendText(from, `*INFORMASI*\n\nVCard belum support pada WhatsApp Bot ini, artinya kontak yang kamu kirim tidak sampai ke partner\n\nKamu bisa menggunakan perintah */sharecontact* untuk membagikan kontak WhatsApp kamu ke partner`)
                                        break

                                    case 'document':
                                        await client.sendText(from, `*INFORMASI*\n\nFile dokumen belum support pada WhatsApp Bot ini, artinya dokumen yang kamu kirim tidak sampai ke partner`)
                                        break

                                    case 'image':
                                        console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Picture from', color('+' + from.replace('@c.us', '')), 'to', color('+' + anon.partner.replace('@c.us', '')))

                                        filename = `${message.t}.${mime.extension(message.mimetype)}`
                                        mediaData = await decryptMedia(message, uaOverride)
                                        imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`

                                        var safe_message = await filterMessage(body)

                                        await client.sendImage(anon.partner, imageBase64, filename, `${safe_message}`)
                                        break

                                    case 'location':
                                        console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Location from', color('+' + from.replace('@c.us', '')), 'to', color('+' + anon.partner.replace('@c.us', '')))

                                        const { loc, lat, lng } = message
                                        await client.sendLocation(anon.partner, lat, lng, loc)
                                            .catch(err => console.error(color('[ERROR]', 'red'), err))
                                        break

                                    case 'revoked':
                                        // revoked message
                                        break

                                    case 'sticker':
                                        // menunggu sendRawWebpAsSticker bisa dipakai
                                        filename = `${__dirname}/../writeable/${message.t}.${mime.extension(message.mimetype)}`
                                        const convertname = `${__dirname}/../writeable/${message.t}.convert.png`
                                        mediaData = await decryptMedia(message, uaOverride)

                                        await fs.writeFile(filename, mediaData)
                                            .then(async () => {
                                                await webp.dwebp(filename, convertname, '-o')
                                                    .then(async () => {
                                                        console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Sticker from', color('+' + from.replace('@c.us', '')), 'to', color('+' + anon.partner.replace('@c.us', '')))

                                                        imageBase64 = await fs.readFile(convertname, { encoding: 'base64' })

                                                        await client.sendImageAsSticker(anon.partner, `data:image/png;base64,${imageBase64}`)
                                                            .then(async () => {
                                                                await fs.unlink(filename)
                                                                await fs.unlink(convertname)
                                                            })
                                                    }).catch(() => {
                                                        fs.unlink(filename)

                                                        client.sendText(from, `*INFORMASI*\n\nStiker bergerak belum support pada WhatsApp Bot ini, artinya stiker yang kamu kirim tidak sampai ke partner`)
                                                    })
                                            })
                                            .catch(err => console.error(color('[ERROR]', 'red'), err))
                                        // menunggu sendRawWebpAsSticker bisa dipakai
                                        break

                                    case 'chat':
                                        console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color('+' + from.replace('@c.us', '')), 'to', color('+' + anon.partner.replace('@c.us', '')))

                                        var safe_message = await filterMessage(body)
                                        await client.sendText(anon.partner, safe_message)
                                        break

                                    case 'video':
                                        await client.sendText(from, `*INFORMASI*\n\nFile video belum support pada WhatsApp Bot ini, artinya video yang kamu kirim tidak sampai ke partner`)
                                        break

                                    case 'ptt':
                                        console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Voice note from', color('+' + from.replace('@c.us', '')), 'to', color('+' + anon.partner.replace('@c.us', '')))

                                        mediaData = await decryptMedia(message, uaOverride)
                                        const pttBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`

                                        await client.sendPtt(anon.partner, pttBase64)
                                        break

                                    default:
                                        // unknown message type
                                        break
                                }
                            } else {
                                if (tempdata.get(mapkey) == undefined) {
                                    tempdata.set(mapkey, false)
                                }
                                if (tempdata.get(mapkey) == false && searching(from, tempdata)) {
                                    await client.sendText(from, `Ketik */search* untuk menemukan partner`)
                                }
                                tempdata.set(mapkey, true)
                            }
                            break
                    }
                } else {
                    const mapkey = from + suffix.notreg

                    if (tempdata.get(mapkey) == undefined) {
                        tempdata.set(mapkey, false)
                    }
                    if (tempdata.get(mapkey) == false) {
                        await client.sendText(from, `Ketik */start* untuk memulai`)
                    }
                    tempdata.set(mapkey, true)
                }
            })
            .catch(err => console.error(color('[ERROR]', 'red'), err))
    } catch (err) {
        console.error(color('[ERROR]', 'red'), err)
    }
}

const filterMessage = async (message) => {
    // filter message
    filter.removeWords('suka')
    try {
        body = await filter.clean(`${body}`)
    } catch (err) {
        body = message
    }

    return await body
}

const searchPartner = async (client, message, connection, tempdata) => {
    const { from, t } = message

    await client.sendText(from, `Mencari partner...`)
    await query.update(connection, { contact: from }, { status: 1 })
        .then(async () => {
            await query.partner(connection, from)
                .then(async (res) => {
                    var datatype = (typeof res)

                    if (datatype != 'string' && res != 'nothing') {
                        var rowdata = [
                            { contact: from },
                            { contact: res.contact }
                        ]
                        var updatedata = [
                            { partner: res.contact, status: 0 },
                            { partner: from, status: 0 }
                        ]

                        await query.multiple(connection, rowdata, updatedata)
                            .then(async () => {
                                console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color('+' + from.replace('@c.us', '')), 'meets', color('+' + res.contact.replace('@c.us', '')))

                                match(from, tempdata)

                                await client.sendText(from, `Partner ditemukan🐵\n*/next* — Temukan partner baru\n*/stop* — Hentikan percakapan ini`)
                            })
                            .catch(err => console.log(color('[ERROR]', 'red'), err))
                    } else {
                        await query.retrieve(connection, from)
                            .then(async (human) => {
                                if (human.partner == null) {
                                    await query.update(connection, { contact: from }, { status: 0 })
                                        .then(async () => {
                                            console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color('+' + from.replace('@c.us', '')), 'could not find partner')

                                            searching(from, tempdata, false)

                                            await client.sendText(from, `Partner tidak dapat ditemukan🥺\n\nMungkin kamu bisa coba beberapa saat lagi, yang sabar yaa😉`)
                                        })
                                } else {
                                    var rowdata = [
                                        { contact: from },
                                        { contact: human.partner }
                                    ]
                                    var updatedata = [
                                        { status: 0 },
                                        { partner: from, status: 0 }
                                    ]

                                    await query.multiple(connection, rowdata, updatedata)
                                        .then(async () => {
                                            console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color('+' + from.replace('@c.us', '')), 'meets', color('+' + human.partner.replace('@c.us', '')))

                                            match(from, tempdata)

                                            await client.sendText(from, `Partner ditemukan🐵\n*/next* — Temukan partner baru\n*/stop* — Hentikan percakapan ini`)
                                        })
                                }
                            })
                            .catch(err => console.log(color('[ERROR]', 'red'), err))
                    }
                })
                .catch(err => console.error(color('[ERROR]', 'red'), err))
        })
        .catch(err => console.error(color('[ERROR]', 'red'), err))
}

const searching = (from, tempdata, status = true) => {
    const mapkey = from + suffix.search
    if (status == true) {
        var output = false

        if (tempdata.get(mapkey) == undefined) {
            tempdata.set(mapkey, false)
        }
        if (tempdata.get(mapkey) == false) {
            output = true
        }
        tempdata.set(mapkey, true)
        return output
    } else {
        return tempdata.set(mapkey, false)
    }
}

const match = (from, tempdata) => {
    const nopart = from + suffix.nopart
    const search = from + suffix.search

    tempdata.set(nopart, false)
    tempdata.set(search, false)
}
