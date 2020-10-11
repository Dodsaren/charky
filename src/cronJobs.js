const CronJob = require('cron').CronJob
const eventbus = require('./eventbus')
const crisis = require('./crisis')

function setupCronjobs() {
  const morningCron = new CronJob('00 00 09 * * *', async () => {
    const date = new Date()
    switch (date.getDay()) {
      case 5:
        eventbus.publish(
          'äntligen fredag charkuterister. carpe diem, trevlig helg.',
        )
        break
    }
    const msg = await crisis()
    eventbus.publish(msg)
  })
  const eveningCron = new CronJob('00 00 18 * * *', () => {
    const date = new Date()
    switch (date.getDay()) {
      case 0:
        eventbus.publish('https://imgur.com/gallery/BUz67Gn')
        break
    }
  })
  morningCron.start()
  eveningCron.start()
}

module.exports = setupCronjobs
