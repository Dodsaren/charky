require('dotenv').config()
const { setupCronjobs } = require('./src/cronJobs')
const initBot = require('./src/bot')

function main() {
  setupCronjobs()
  initBot()
}

main()
