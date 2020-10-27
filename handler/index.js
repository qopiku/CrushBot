require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const mime = require('mime-types')
const moment = require('moment-timezone')
const fs = require('fs').promises
const webp = require('webp-converter')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const Filter = require('bad-words')
const filter = new Filter()
const { color, processTime, isUrl } = require('../utils')
const menuText = require('../message')
const query = require('./query')

module.exports = msgHandler = async (client = new Client(), message, db) => {
    try {
        const { type, from, t, sender, isGroupMsg, chat, caption, mimetype } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account

        // Bot Prefix
        const prefix = '/'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const uaOverride = process.env.UserAgent

        filter.removeWords('suka')
        // Add words to the blacklist
        filter.addWords('anjing', 'babi', 'kunyuk', 'bajingan', 'asu', 'bangsat', 'kampret', 'kontol', 'memek', 'ngentot', 'pentil', 'perek', 'pepek', 'pecun', 'bencong', 'banci', 'maho', 'gila', 'sinting', 'tolol', 'sarap', 'lonte', 'hencet', 'taptei', 'kampang', 'pilat', 'keparat', 'bejad', 'gembel', 'brengsek', 'tai', 'anjrit', 'bangsat', 'fuck', 'tete', 'tetek', 'ngulum', 'jembut', 'totong', 'kolop', 'puki', 'pukimak', 'bodat', 'heang', 'jancuk', 'burit', 'titit', 'nenen', 'bejat', 'silit', 'sempak', 'fucking', 'asshole', 'bitch', 'penis', 'vagina', 'klitoris', 'kelentit', 'borjong', 'dancuk', 'pantek', 'taek', 'itil', 'teho', 'bejat', 'bagudung', 'babami', 'kanciang', 'bungul', 'idiot', 'kimak', 'henceut', 'kacuk', 'blowjob', 'pussy', 'dick', 'damn', 'ass')
        const safeMessages = filter.clean((type === 'chat') ? message.body : ((type === 'image' && caption)) ? caption : '')

        // If this message is from a group
        if (isGroupMsg) {
            return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle))
        }

        // Call a query inserting and retrieving client data
        await query.people(db, from)
        .then(async (people) => {
            // If this message is a commands
            if (isCmd) {
                console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))

                switch (command) {
                    // CHECK COMMAND
                    case 'speed':
                    case 'ping': {
                        client.sendText(from, `Pong!!!\nKecepatan proses: ${processTime(t, moment())} _detik_`)
                        break
                    }
                    // BOT COMMANDS
                    case 'help': {
                        client.sendText(from, menuText.help() + `\n\n` + menuText.commands())
                        break
                    }
                    case 'about': {
                        const loadedMsg = await client.getAmountOfLoadedMessages()
                        const chatIds = await client.getAllChatIds()
                        const groups = await client.getAllGroups()
                        var statistics = {
                            chatroom: (chatIds.length - groups.length),
                            messages: loadedMsg
                        }

                        await client.sendText(from, menuText.about(statistics))
                        break
                    }
                    case 'donate': {
                        client.sendText(from, menuText.donate())
                        break
                    }
                    // CLIENT COMMAND
                    case 'search': {
                        if (people.partner && people.partner !== null) return client.sendText(from, `Sekarang kamu sedang dalam percakapan🤔\n*/next* — Temukan pasangan baru\n*/stop* — Hentikan percakapan ini`)

                        setTimeout(() => {
                            client.sendText(from, `Mencari pasangan...`)
                        }, 2000)

                        query.status(db, from)
                        .then(() => {
                            query.search(db, from)
                            .then(async (res) => {
                                var result = await res
                                var datatype = (typeof result)

                                if (datatype != "string" && result != "nothing") {
                                    var updateData = [
                                        { partner: result.contact, contact: from, status: 0 },
                                        { partner: from, contact: result.contact, status: 0 },
                                    ]
                                    await query.update(db, updateData)
                                    .then(async () => {
                                        await client.sendText(from, `Pasangan ditemukan🐵\n*/next* — Temukan pasangan baru\n*/stop* — Hentikan percakapan ini`)
                                    })
                                    .catch(err => console.log(color('[ERROR]', 'red'), err))
                                } else {
                                    await client.sendText(from, `Pasangan tidak dapat ditemukan🥺\n\nAyo bantu sebarluaskan nomor bot ini yaa, supaya kamu lebih mudah untuk mendapatkan pasangan😉`)
                                }
                            })
                            .catch(err => console.log(color('[ERROR]', 'red'), err))
                        })
                        .catch(err => console.log(color('[ERROR]', 'red'), err))
                        break
                    }
                    case 'next': {
                        var dataUpdate
                        if (people.partner && people.partner !== null) {
                            dataUpdate = [
                                { partner: null, contact: from, status: 0 },
                                { partner: null, contact: people.partner, status: 0 },
                            ]
                        } else {
                            dataUpdate = [
                                { partner: null, contact: from, status: 0 },
                            ]
                        }

                        query.update(db, dataUpdate)
                        .then(() => {
                            if (people.partner && people.partner !== null) {
                                client.sendText(people.partner, `Pasangan kamu telah menghentikan percakapan😔\nKetik */search* untuk menemukan pasangan baru`)
                            }

                            client.sendText(from, `Mencari pasangan...`)
                            query.status(db, from)
                            .then(() => {
                                query.search(db, from)
                                .then(async (res) => {
                                    var result = await res
                                    var datatype = (typeof result)

                                    if (datatype != "string" && result != "nothing") {
                                        var updateData = [
                                            { partner: result.contact, contact: from, status: 0 },
                                            { partner: from, contact: result.contact, status: 0 },
                                        ]
                                        await query.update(db, updateData)
                                        .then(async () => {
                                            await client.sendText(from, `Pasangan ditemukan🐵\n*/next* — Temukan pasangan baru\n*/stop* — Hentikan percakapan ini`)
                                        })
                                        .catch(err => console.log(color('[ERROR]', 'red'), err))
                                    } else {
                                        await client.sendText(from, `Pasangan tidak dapat ditemukan🥺\n\nAyo bantu sebarluaskan nomor bot ini yaa, supaya kamu lebih mudah untuk mendapatkan pasangan😉`)
                                    }
                                })
                                .catch(err => console.log(color('[ERROR]', 'red'), err))
                            })
                            .catch(err => console.log(color('[ERROR]', 'red'), err))
                        })
                        .catch(err => console.log(color('[ERROR]', 'red'), err))
                        break
                    }
                    case 'stop': {
                        if (people.partner && people.partner !== null) {
                            var dataUpdate = [
                                { partner: null, contact: from, status: 0 },
                                { partner: null, contact: people.partner, status: 0 },
                            ]
                            query.update(db, dataUpdate)
                            .then(() => {
                                client.sendText(people.partner, `Pasangan kamu telah menghentikan percakapan😔\nKetik */search* untuk menemukan pasangan baru`)
                                client.sendText(from, `Kamu menghentikan percakapan🙄\nKetik */search* untuk menemukan pasangan baru`)
                            })
                            .catch(err => console.log(color('[ERROR]', 'red'), err))
                        } else {
                            client.sendText(from, `Kamu belum memiliki pasangan🤔\nKetik */search* untuk menemukan pasangan baru`)
                        }
                        break
                    }
                    case 'sharecontact': {
                        if (people.partner && people.partner !== null) {
                            client.sendContact(people.partner, from)
                            client.sendText(from, `Kontak WhatsApp kamu telah dikirim ke pasangan`)
                        } else {
                            client.sendText(from, `Kamu belum memiliki pasangan🤔\nKetik */search* untuk menemukan pasangan`)
                        }
                        break
                    }
                    // DEFAULT STATEMENT
                    default: {
                        console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
                        break
                    }
                }
            }
            // Else (if this message is'nt a commands)
            else {
                if (people.partner && people.partner !== null) {
                    console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'for', color('+' + people.partner.replace('@c.us', '')))

                    switch (type) {
                        case 'image': {
                            const filename = `${message.t}.${mime.extension(message.mimetype)}`
                            const mediaData = await decryptMedia(message, uaOverride)
                            const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                            await client.sendImage(people.partner, imageBase64, filename, `${safeMessages}`)
                            break
                        }
                        case 'sticker': {
                            // Padahal gampang pake sendRawWebpAsSticker keliatannya, cuma eh belum siap pakai kata open-wa hehe

                            const filename = `${__dirname}/../files/${message.t}.${mime.extension(message.mimetype)}`
                            const convertname = `${__dirname}/../files/${message.t}.png`
                            const mediaData = await decryptMedia(message, uaOverride)

                            fs.writeFile(filename, mediaData)
                            .then(() => {
                                const result = webp.dwebp(filename, convertname, '-o')
                                result.then(async () => {
                                    const imageBase64 = await fs.readFile(convertname, { encoding: 'base64' })
                                    await client.sendImageAsSticker(people.partner, `data:image/png;base64,${imageBase64}`)
                                    .then(() => {
                                        fs.unlink(filename)
                                        fs.unlink(convertname)
                                    })
                                })
                                .catch((err) => {
                                    fs.unlink(filename)
                                    client.sendText(from, `*INFORMASI*\nStiker bergerak belum support pada WhatsApp Bot ini, artinya stiker yang kamu kirim tidak sampai ke pasangan`)
                                    console.log(color('[ERROR]', 'red'), `Tidak support sticker bergerak sayang :(`)
                                })
                            })
                            .catch(err => console.log(color('[ERROR]', 'red'), err))
                            break
                        }
                        case 'video': {
                            client.sendText(from, `*INFORMASI*\nVideo belum support pada WhatsApp Bot ini, artinya video yang kamu kirim tidak sampai ke pasangan`)
                            break
                        }
                        case 'document': {
                            client.sendText(from, `*INFORMASI*\nDokumen belum support pada WhatsApp Bot ini, artinya dokumen yang kamu kirim tidak sampai ke pasangan`)
                            break
                        }
                        case 'location': {
                            client.sendText(from, `*INFORMASI*\nLokasi belum support pada WhatsApp Bot ini, artinya lokasi yang kamu kirim tidak sampai ke pasangan`)
                            break
                        }
                        case 'audio': {
                            client.sendText(from, `*INFORMASI*\nAudio belum support pada WhatsApp Bot ini, artinya audio yang kamu kirim tidak sampai ke pasangan`)
                            break
                        }
                        case 'vcard': {
                            client.sendText(from, `*INFORMASI*\nVCard bergerak belum support pada WhatsApp Bot ini, artinya VCard yang kamu kirim tidak sampai ke pasangan`)
                            break
                        }
                        case 'ptt': {
                            const mediaData = await decryptMedia(message, uaOverride)
                            const pttBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                            await client.sendPtt(people.partner, pttBase64)
                            break
                        }
                        default: {
                            const urlify = (text) => {
                                var urlRegex = /(https?:\/\/[^\s]+)/g;
                                return text.match(urlRegex)
                            }
                            if (urlify(safeMessages) != undefined && urlify(safeMessages).length > 0) {
                                await client.sendLinkWithAutoPreview(people.partner, urlify(safeMessages)[0], safeMessages)
                            } else {
                                await client.sendText(people.partner, safeMessages)
                            }
                            break
                        }
                    }
                } else {
                    client.sendText(from, `Ketik */search* untuk menemukan pasangan`)
                }
            }
        })
        .catch(err => console.log(color('[ERROR]', 'red'), err))
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}
