const chalk = require('chalk')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

/**
 * Get text with color
 * @param  {String} text
 * @param  {String} color
 * @return  {String} Return text with color
 */
const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

/**
 * Get Time duration
 * @param  {Date} timestamp
 * @param  {Date} now
 */
const processTime = (timestamp, now) => {
    // timestamp => timestamp when message was received
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}
/**
 * is it url?
 * @param  {String} url
 */
const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi))
}

module.exports = {
    processTime,
    isUrl,
    color
}
