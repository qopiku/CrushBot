// require('dotenv').config({ path: __dirname + '/../../.env' })
const rethink = require('rethinkdb')
const name = process.env.RETHINK_DB

module.exports = update = (connection, row, update) => {
    return new Promise(async (resolve, reject) => {
        rethink.db(name).table('clients')
            .filter(row)
            .update(update)
            .run(connection, (err, res) => {
                if (err) return reject(err)

                return resolve(res)
            })
    })
}