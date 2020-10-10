const CronJob = require('cron').CronJob
const eventbus = require('./eventbus')
const crisis = require('./crisis')

function setupCronjobs() {
  const dailyCronJob = new CronJob('00 00 09 * * *', () => {
    const date = new Date()
    switch (date.getDay()) {
      case 5:
        eventbus.publish(
          'äntligen fredag charkuterister. carpe diem, trevlig helg.',
        )
        break
      case 7:
        eventbus.publish('https://imgur.com/gallery/BUz67Gn')
        break
    }
  })
  const crisisCronJob = new CronJob('00 05 09 * * *', async () => {
    const msg = await crisis()
    eventbus.publish(msg)
  })
  dailyCronJob.start()
  crisisCronJob.start()
}

module.exports = setupCronjobs
