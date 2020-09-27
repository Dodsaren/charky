const subs = []

const eventbus = {
  subscribe: (callback) => {
    const symbol = Symbol()
    subs.push({
      symbol,
      callback,
    })
    return () => {
      subs.splice(
        subs.findIndex((x) => x.symbol === symbol),
        1,
      )
    }
  },
  publish: (message) => {
    subs.forEach((x) => {
      x.callback(message)
    })
  },
}

module.exports = eventbus
