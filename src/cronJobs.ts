import cron from 'cron'
import eventbus from './eventbus'
import giphyClient from './giphyClient'
import logger from './logger'
import getPatchNotes from './services/csPatchNoteClient'

const CronJob = cron.CronJob

function setupCronjobs() {
  const mCron = new CronJob('00 00 09 * * *', morning)
  const hCron = new CronJob('00 00 * * * *', hourly)
  mCron.start()
  hCron.start()
  logger('cron jobs started')
}

async function morning() {
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
}

function hourly() {
  csPatchNotes()
}

async function csPatchNotes() {
  const patchNotes = await getPatchNotes()
  if (patchNotes?.length) {
    patchNotes.forEach(eventbus.publish)
  }
}

export default setupCronjobs
