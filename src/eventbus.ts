import logger from './logger'

type SubscriberCallback = (msg: string) => void
const subs: { symbol: Symbol; callback: SubscriberCallback }[] = []

const eventbus = {
  subscribe: (callback: SubscriberCallback) => {
    const symbol = Symbol()
    subs.push({
      symbol,
      callback,
    })
    logger.info(
      'subscriber added to eventbus, new subscriber count',
      subs.length,
    )
    return () => {
      subs.splice(
        subs.findIndex((x) => x.symbol === symbol),
        1,
      )
    }
  },
  publish: (message: string) => {
    if (!message) {
      return
    }
    subs.forEach((x) => {
      x.callback(message)
    })
  },
}

export default eventbus
