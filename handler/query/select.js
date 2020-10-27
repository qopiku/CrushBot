module.exports = select = (db, contact) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Retrieving client data in the database
            const people = db.prepare(`SELECT * FROM clients WHERE contact = ?`).get(contact)

            resolve(people)
        } catch (err) {
            reject(err)
        }
    })
}