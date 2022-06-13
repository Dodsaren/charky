import cron from 'cron'
import eventbus from './eventbus'
import giphyClient from './giphyClient'
import logger from './logger'

const CronJob = cron.CronJob

function setupCronjobs() {
  const morningCron = new CronJob('00 00 09 * * *', async () => {
    const date = new Date()
    switch (date.getDay()) {
      case 1:
        eventbus.publish(await giphyClient.getRandom('monday'))
        logger('published monday gif')
        break
      case 5:
        eventbus.publish(await giphyClient.getRandom('friday'))
        logger('published friday gif')
        break
    }
    logger('morning cron done')
  })
  morningCron.start()
  logger('cron jobs started')
}

export default setupCronjobs
