import dotenv from 'dotenv'
dotenv.config()
import setupCronjobs from './src/cronJobs'
import initBot from './src/bot'
import logger from './src/logger'

logger('APP LOADED WITH ENV:', process.env)

function main() {
  setupCronjobs()
  initBot()
}

main()
