const rethink = require('rethinkdb')
const name = process.env.RETHINK_DB

module.exports = insert = (connection, contact, pushname) => {
    pushname = pushname.replace(/[\u00A0-\u9999<>\&]/g, (i) => {
        return '&#' + i.charCodeAt(0) + ';';
    });

    return new Promise(async (resolve, reject) => {
        rethink.db(name).table('clients').filter(rethink.row('contact').eq(contact))
            .run(connection, (err, cursor) => {
                if (err) return reject(err)

                cursor.toArray((err, result) => {
                    if (err) return reject(err)

                    if (!result.length) {
                        rethink.db(name).table('clients').insert([
                            {
                                contact: contact,
                                name: pushname,
                                partner: null,
                                status: 0
                            }
                        ]).run(connection, (err, res) => {
                            if (err) return reject(err)

                            return resolve(res)
                        })
                    } else return resolve({
                        "unchanged": 0,
                        "skipped": 0,
                        "replaced": 0,
                        "inserted": 0,
                        "generated_keys": [],
                        "errors": 0,
                        "deleted": 0
                    });
                })
            })
    })
}