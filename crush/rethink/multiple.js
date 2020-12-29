const rethink = require('rethinkdb')
const name = process.env.RETHINK_DB

module.exports = multiple = (connection, row, update) => {
    return new Promise(async (resolve, reject) => {
        var i, count = 0, interval

        try {
            if (row.length != update.length) {
                return reject('data row and update length are not the same')
            } else {
                for (i = 0; i < row.length; i++) {
                    rethink.db(name).table('clients')
                        .filter(row[i])
                        .update(update[i])
                        .run(connection, (err) => {
                            if (err) return reject(err)

                            count++
                        })
                }

                interval = setInterval(() => {
                    if (count == row.length) {
                        resolve(true)
                        return clearInterval(interval)
                    }
                }, 100)
            }
        } catch (err) {
            return reject(err)
        }
    })
}