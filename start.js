require('dotenv').config()
const rethink = require('rethinkdb')
const bot = require('./crush/bot')

const temp = new Map()

const start = (host = 'localhost', port = 28015) => {
    rethink.connect({ host: host, port: port }, (err, conn) => {
        if (err) throw err
        rethink.dbCreate('crush').run(conn, () => {
            rethink.db('crush').tableCreate('messages').run(conn, () => { })
            rethink.db('crush').tableCreate('clients').run(conn, () => {
                bot.start(conn, temp)
            })
        })
    })
}

start(process.env.RETHINK_HOST, process.env.RETHINK_PORT)