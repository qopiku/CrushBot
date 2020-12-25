const chalk = require('chalk')
const updateJson = require('update-json-file')

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

// Color
const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

// 
const processTime = (timestamp, now) => {
    // timestamp => timestamp when message was received
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

// Message type Log
const logging = (fromMe, type) => updateJson(__dirname + '/../writeable/crush.json', (data) => {
    (fromMe) ? (data.sent[type]) ? data.sent[type] += 1 : data.sent[type] = 1 : (data.receive[type]) ? data.receive[type] += 1 : data.receive[type] = 1
    return data
})

module.exports = {
    color,
    processTime,
    logging
}