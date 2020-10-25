module.exports = search = (db, contact) => {
    return new Promise(async (resolve, reject) => {
        try {
            setTimeout(() => {
                setTimeout(() => {
                    return resolve("nothing")
                }, 20000)
    
                var looping = setInterval(() => {
                    // Select random that has no partner
                    const result = db.prepare(`SELECT * FROM clients WHERE id IN (SELECT id FROM clients WHERE status = 1 AND partner IS NULL AND contact IS NOT '${contact}' ORDER BY RANDOM() LIMIT 1)`).get()

                    // Check whether you have got a partner
                    const people = db.prepare(`SELECT * FROM clients WHERE contact = ?`).get(contact)
    
                    if (people.partner != null) {
                        const partner = db.prepare(`SELECT * FROM clients WHERE contact = ?`).get(people.partner)
                        resolve(partner)
                        return clearInterval(looping)
                    }
                    if (result !== undefined) {
                        resolve(result)
                        return clearInterval(looping)
                    }
                }, 2000)
            }, ((Math.random() * (1.520 - 0.0200) + 0.0200).toFixed(4) * 1000))
        } catch (err) {
            reject(err)
        }
    })
}