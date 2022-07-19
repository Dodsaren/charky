import dotenv from 'dotenv'
dotenv.config()
import setupCronjobs from './src/cronJobs'
import initBot from './src/bot'

function main() {
  setupCronjobs()
  initBot()
}

main()
