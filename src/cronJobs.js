const CronJob = require('cron').CronJob
const eventbus = require('./eventbus')
const crisisClient = require('./crisisClient')
const giphyClient = require('./giphyClient')
const { updateTourneys, presenter } = require('./sc2tourneys')
const logger = require('./logger')

let crisisReportingActivated = false
function toggleCrisisReportingActivated() {
  crisisReportingActivated = !crisisReportingActivated
  logger('toggling crisis reporting to', crisisReportingActivated)
  return crisisReportingActivated
}

let lastCrisisTimeStamp = null

function setupCronjobs() {
  const morningCron = new CronJob('00 00 09 * * *', async () => {
    const date = new Date()
    switch (date.getDay()) {
      case 1:
        updateTourneys()
        eventbus.publish(await giphyClient.getRandom('monday'))
        logger('published monday gif')
        break
      case 5:
        eventbus.publish(await giphyClient.getRandom('friday'))
        logger('published friday gif')
        break
    }
    eventbus.publish(presenter())
    logger('morning cron done')
  })
  const hourlyCron = new CronJob('00 00 * * * *', async () => {
    const crisers = await crisisClient.feed()
    if (!crisers.length) {
      logger('hourly cron done but no crises to report')
      return
    }
    const filteredCrisers = crisers.filter(
      (x) => new Date(lastCrisisTimeStamp) < new Date(x.Updated),
    )
    if (!filteredCrisers.length) {
      logger('hourly cron done but no new crises to report')
      return
    }
    lastCrisisTimeStamp = filteredCrisers[0].Updated
    if (crisisReportingActivated) {
      eventbus.publish(crisisClient.render(filteredCrisers))
    }
    logger('hourly cron done')
  })
  morningCron.start()
  hourlyCron.start()
  logger('cron jobs started')
}

module.exports = { setupCronjobs, toggleCrisisReportingActivated }
