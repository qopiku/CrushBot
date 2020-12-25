require('dotenv').config({ path: __dirname + '/../../.env' })
const rethink = require('rethinkdb')
const retrieve = require('./retrieve')

const start = (host = 'localhost', port = 28015) => {
    rethink.connect({ host: host, port: port }, (err, conn) => {
        if (err) throw err

        rethink.db('crush').tableCreate('clients').run(conn, () => {
            retrieve(conn, '6283861415641@c.us').then((result) => {
                console.log(result)
            })
        })
    })
}

start(process.env.RETHINK_HOST, process.env.RETHINK_PORT)