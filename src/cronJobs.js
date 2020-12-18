const CronJob = require('cron').CronJob
const eventbus = require('./eventbus')
const crisisClient = require('./crisisClient')
const giphyClient = require('./giphyClient')

let lastCrisisTimeStamp = null

function setupCronjobs() {
  const morningCron = new CronJob('00 00 09 * * *', async () => {
    const date = new Date()
    switch (date.getDay()) {
      case 1:
        eventbus.publish(await giphyClient.getRandom('monday'))
        break
      case 5:
        eventbus.publish(await giphyClient.getRandom('friday'))
        break
    }
    const msg = await crisis()
    eventbus.publish(msg)
  })
  const hourlyCron = new CronJob('00 00 * * * *', async () => {
    const crisers = await crisisClient.feed()
    if (!crisers.length) {
      return
    }
    const filteredCrisers = crisers.filter(
      (x) => new Date(lastCrisisTimeStamp) < new Date(x.Updated),
    )
    if (!filteredCrisers.length) {
      return
    }
    lastCrisisTimeStamp = filteredCrisers[0].Updated
    eventbus.publish(crisisClient.render(filteredCrisers))
  })
  morningCron.start()
  hourlyCron.start()
}

module.exports = setupCronjobs
