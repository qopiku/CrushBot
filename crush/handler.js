const { decryptMedia } = require('@open-wa/wa-automate')
const { color, processTime } = require('./utils')
const mime = require('mime-types')
const fs = require('fs').promises
const webp = require('webp-converter')
const query = require('./rethink/index')
const text = require('./text')

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

const Filter = require('bad-words')
const filter = new Filter()

var _date = new Date(),
    year = _date.getFullYear(),
    month = (_date.getMonth() + 1),
    date = _date.getDate(),
    dateNow = year + '-' + month + '-' + date

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

        filter.removeWords('suka')
        // add words to the blacklist
        filter.addWords('anjing', 'babi', 'kunyuk', 'bajingan', 'asu', 'bangsat', 'kampret', 'kontol', 'memek', 'ngentot', 'pentil', 'perek', 'pepek', 'pecun', 'bencong', 'banci', 'maho', 'gila', 'sinting', 'tolol', 'sarap', 'lonte', 'hencet', 'taptei', 'kampang', 'pilat', 'keparat', 'bejad', 'gembel', 'brengsek', 'tai', 'anjrit', 'bangsat', 'fuck', 'tete', 'tetek', 'ngulum', 'jembut', 'totong', 'kolop', 'puki', 'pukimak', 'bodat', 'heang', 'jancuk', 'burit', 'titit', 'nenen', 'bejat', 'silit', 'sempak', 'fucking', 'asshole', 'bitch', 'penis', 'vagina', 'klitoris', 'kelentit', 'borjong', 'dancuk', 'pantek', 'taek', 'itil', 'teho', 'bejat', 'bagudung', 'babami', 'kanciang', 'bungul', 'idiot', 'kimak', 'henceut', 'kacuk', 'blowjob', 'pussy', 'dick', 'damn', 'ass')
        var safeMessage = ''
        try {
            safeMessage = filter.clean(body)
        } catch (err) {
            safeMessage = body
        }

        // ignore chat from groups
        if (isGroupMsg) return

        // public commands
        switch (body) {
            case '/start':
                return query.insert(connection, from, pushname)
                    .then(() => {
                        client.sendText(from, text.start())
                    })
                    .catch(err => console.error(color('[ERROR]', 'red'), err))
                break

            case '/speed':
            case '/ping':
                return client.sendText(from, `Pong!!!\nKecepatan proses: ${processTime(t, moment())} detik.`)
                break

            case '/help':
                return client.sendText(from, text.help())
                break

            case '/about':
                var loadedMsg = await client.getAmountOfLoadedMessages(),
                    chatIds = await client.getAllChatIds(),
                    groups = await client.getAllGroups()

                return client.sendText(from, text.about({
                    chatroom: (chatIds.length - groups.length),
                    messages: loadedMsg
                }))
                break

            case '/donate':
                return client.sendText(from, text.donate())
                break

            default:
                break
        }

        // registered client commands
        query.retrieve(connection, from)
            .then(async (people) => {
                if (people.length) {
                    const anon = people[0]
                    const mapkey = from + suffix.nopart

                    switch (body) {
                        case '/search':
                            if (anon.partner && anon.partner !== null) {
                                client.sendText(from, `Sekarang kamu sedang dalam percakapan🤔\n*/next* — Temukan partner baru\n*/stop* — Hentikan percakapan ini`)
                            } else {
                                if (searching(from, tempdata)) {
                                    searchPartner(client, from, connection, tempdata)
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

                            query.multiple(connection, rowdata, updatedata)
                                .then(() => {
                                    if (anon.partner && anon.partner !== null) {
                                        client.sendText(anon.partner, `Partner kamu telah menghentikan percakapan😔\nKetik */search* untuk menemukan partner baru`)
                                    }

                                    if (searching(from, tempdata)) {
                                        searchPartner(client, from, connection, tempdata)
                                    }
                                })
                                .catch(err => console.error(color('[ERROR]', 'red'), err))
                            break

                        case '/stop':
                            if (anon.partner && anon.partner !== null) {
                                tempdata.set(mapkey, false)

                                query.update(connection, { contact: anon.partner }, { partner: null, status: 0 })
                                    .then(() => {
                                        client.sendText(anon.partner, `Partner kamu telah menghentikan percakapan😔\nKetik */search* untuk menemukan partner baru`)
                                    })
                                    .catch(err => console.log(color('[ERROR]', 'red'), err))

                                query.update(connection, { contact: from }, { partner: null, status: 0 })
                                    .then(() => {
                                        client.sendText(from, `Kamu menghentikan percakapan🙄\nKetik */search* untuk menemukan partner baru`)
                                    })
                                    .catch(err => console.log(color('[ERROR]', 'red'), err))
                            } else {
                                client.sendText(from, `Kamu belum memiliki partner🤔\nKetik */search* untuk menemukan partner`)
                            }
                            break

                        case '/sharecontact':
                            if (anon.partner && anon.partner !== null) {
                                client.sendContact(anon.partner, from)
                                client.sendText(from, `Kontak WhatsApp kamu telah dikirim ke partner`)
                            } else {
                                client.sendText(from, `Kamu belum memiliki partner🤔\nKetik */search* untuk menemukan partner`)
                            }
                            break

                        default:
                            if (anon.partner && anon.partner !== null) {
                                tempdata.set(mapkey, false)
                                var filename, mediaData, imageBase64

                                console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'for', color('+' + anon.partner.replace('@c.us', '')))

                                switch (type) {
                                    case 'audio':
                                        client.sendText(from, `*INFORMASI*\n\nFile audio belum support pada WhatsApp Bot ini, artinya audio yang kamu kirim tidak sampai ke partner`)
                                        break

                                    case 'vcard':
                                        client.sendText(from, `*INFORMASI*\n\nVCard belum support pada WhatsApp Bot ini, artinya kontak yang kamu kirim tidak sampai ke partner`)
                                        break

                                    case 'multi_vcard':
                                        client.sendText(from, `*INFORMASI*\n\nVCard belum support pada WhatsApp Bot ini, artinya kontak yang kamu kirim tidak sampai ke partner`)
                                        break

                                    case 'document':
                                        client.sendText(from, `*INFORMASI*\n\nFile dokumen belum support pada WhatsApp Bot ini, artinya dokumen yang kamu kirim tidak sampai ke partner`)
                                        break

                                    case 'image':
                                        filename = `${message.t}.${mime.extension(message.mimetype)}`
                                        mediaData = await decryptMedia(message, uaOverride)
                                        imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`

                                        await client.sendImage(anon.partner, imageBase64, filename, `${safeMessage}`)
                                        break

                                    case 'location':
                                        const { loc, lat, lng } = message
                                        client.sendLocation(anon.partner, lat, lng, loc)
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

                                        fs.writeFile(filename, mediaData)
                                            .then(async () => {
                                                await webp.dwebp(filename, convertname, '-o')
                                                    .then(async () => {
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
                                        client.sendText(anon.partner, safeMessage)
                                        break

                                    case 'video':
                                        client.sendText(from, `*INFORMASI*\n\nFile video belum support pada WhatsApp Bot ini, artinya video yang kamu kirim tidak sampai ke partner`)
                                        break

                                    case 'ptt':
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
                                if (tempdata.get(mapkey) == false) {
                                    client.sendText(from, `Ketik */search* untuk menemukan partner`)
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
                        client.sendText(from, `Ketik */start* untuk memulai`)
                    }
                    tempdata.set(mapkey, true)
                }
            })
            .catch(err => console.error(color('[ERROR]', 'red'), err))
    } catch (err) {
        console.error(color('[ERROR]', 'red'), err)
    }
}

const searchPartner = (client, from, connection, tempdata) => {
    client.sendText(from, `Mencari partner...`)

    query.update(connection, { contact: from }, { status: 1 })
        .then(() => {
            query.partner(connection, from)
                .then((res) => {
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

                        query.multiple(connection, rowdata, updatedata)
                            .then(() => {
                                match(from, tempdata)

                                client.sendText(from, `Partner ditemukan🐵\n*/next* — Temukan partner baru\n*/stop* — Hentikan percakapan ini`)
                            })
                            .catch(err => console.log(color('[ERROR]', 'red'), err))
                    } else {
                        query.retrieve(connection, from)
                            .then((human) => {
                                if (human.partner == null) {
                                    query.update(connection, { contact: from }, { status: 0 })
                                        .then(() => {
                                            client.sendText(from, `Partner tidak dapat ditemukan🥺\n\nMungkin kamu bisa coba beberapa saat lagi, yang sabar yaa😉`)
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

                                    query.multiple(connection, rowdata, updatedata)
                                        .then(() => {
                                            match(from, tempdata)

                                            client.sendText(from, `Partner ditemukan🐵\n*/next* — Temukan partner baru\n*/stop* — Hentikan percakapan ini`)
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

const searching = (from, tempdata) => {
    const mapkey = from + suffix.search

    if (tempdata.get(mapkey) == undefined) {
        tempdata.set(mapkey, false)
    }
    if (tempdata.get(mapkey) == false) {
        return true
    }
    tempdata.set(mapkey, true)
    return false
}

const match = (from, tempdata) => {
    const nopart = from + suffix.nopart
    const search = from + suffix.search

    tempdata.set(nopart, false)
    tempdata.set(search, false)
}