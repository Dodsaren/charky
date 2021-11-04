const logger = require('./logger')

const subs = []

const eventbus = {
  subscribe: (callback) => {
    const symbol = Symbol()
    subs.push({
      symbol,
      callback,
    })
    logger('subscriber added to eventbus, new subscriber count', subs.length)
    return () => {
      subs.splice(
        subs.findIndex((x) => x.symbol === symbol),
        1,
      )
    }
  },
  publish: (message) => {
    if (!message) {
      return
    }
    subs.forEach((x) => {
      x.callback(message)
    })
  },
}

module.exports = eventbus
