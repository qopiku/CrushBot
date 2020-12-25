// require('dotenv').config({ path: __dirname + '/../../.env' })
const rethink = require('rethinkdb')
const name = process.env.RETHINK_DB

module.exports = partner = (connection, contact) => {
    return new Promise(async (resolve, reject) => {
        var nothing, looping
        var randtime = ((Math.random() * (1.520 - 0.0200) + 0.0200).toFixed(4) * 1000)

        nothing = setTimeout(() => {
            return resolve('nothing')
        }, (randtime + 20000))

        setTimeout(() => {
            looping = setInterval(() => {
                // check whether you have got a partner
                rethink.db(name).table('clients').filter(rethink.row('contact').eq(contact))
                    .run(connection, (err, cursor) => {
                        if (err) return reject(err)

                        cursor.toArray((err, res) => {
                            if (err) return reject(err)

                            const result = res[0]
                            if (result.partner) {
                                rethink.db(name).table('clients').filter(rethink.row('contact').eq(result.partner))
                                    .run(connection, (err, cursor) => {
                                        if (err) return reject(err)

                                        cursor.toArray((err, partner) => {
                                            if (err) return reject(err)

                                            resolve(partner[0])
                                            clearTimeout(nothing)
                                            return clearInterval(looping)
                                        })
                                    })
                            }
                        })
                    })

                rethink.db('crush').table('clients').filter(rethink.row('contact').ne(contact).and(rethink.row('status').eq(1))).sample(1).run(connection, (error, result) => {
                    if (error) return reject(error)

                    if (result.length) {
                        resolve(result[0])
                        clearTimeout(nothing)
                        return clearInterval(looping)
                    }
                })
            }, 100)
        }, randtime)
    })
}