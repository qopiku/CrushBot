const rethink = require('rethinkdb')
const name = process.env.RETHINK_DB

module.exports = retrieve = (connection, contact) => {
    return new Promise(async (resolve, reject) => {
        rethink.db(name).table('clients').filter(rethink.row('contact').eq(contact))
            .run(connection, (err, cursor) => {
                if (err) return reject(err)

                cursor.toArray((err, result) => {
                    if (err) return reject(err)

                    return resolve(result)
                })
            })
    })
}