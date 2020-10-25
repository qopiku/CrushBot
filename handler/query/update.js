module.exports = update = (db, data = []) => {
    return new Promise(async (resolve, reject) => {
        if (data === undefined || data.length < 1) {
            reject(`The data to be updated cannot be empty`)
        } else {
            try {
                // Prepare update statement
                const update = db.prepare(`UPDATE clients SET partner = @partner, status = @status WHERE contact = @contact`)

                const updateMany = db.transaction((peoples) => {
                    for (const people of peoples) update.run(people)
                })
                updateMany(data)
                
                resolve(true)
            } catch (err) {
                reject(err)
            }
        }
    })
}