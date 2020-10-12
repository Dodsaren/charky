const CronJob = require('cron').CronJob
const eventbus = require('./eventbus')
const crisis = require('./crisis')
const giphyClient = require('./giphyClient')

function setupCronjobs() {
  const morningCron = new CronJob('00 00 09 * * *', async () => {
    const date = new Date()
    switch (date.getDay()) {
      case 1:
        eventbus.publish(await giphyClient.getRandom('monday'))
        break
    }
    const msg = await crisis()
    eventbus.publish(msg)
  })
  const eveningCron = new CronJob('00 00 17 * * *', async () => {
    const date = new Date()
    switch (date.getDay()) {
      case 5:
        eventbus.publish(await giphyClient.getRandom('friday'))
        break
    }
  })
  morningCron.start()
  eveningCron.start()
}

module.exports = setupCronjobs
