module.exports = people = (db, contact) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Insert a new client into the database
            db.prepare(`INSERT INTO clients (contact) SELECT @from WHERE NOT EXISTS (SELECT 1 FROM clients WHERE contact = @from)`).run({ from: contact })

            // Retrieving client data in the database
            const people = db.prepare(`SELECT * FROM clients WHERE contact = ?`).get(contact)

            resolve(people)
        } catch (err) {
            reject(err)
        }
    })
}