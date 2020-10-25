module.exports = status = (db, contact) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Prepare update statement & run
            db.prepare(`UPDATE clients SET status = @status WHERE contact = @contact`).run({ status: 1, contact: contact })

            resolve(true)
        } catch (err) {
            reject(err)
        }
    })
}