const { BOT_SECRET_TOKEN, NASA_API_KEY, BIBLE_API_KEY, REDIS_HOST } =
  process.env
const Discord = require('discord.js')
const fetch = require('node-fetch')
const eventbus = require('./eventbus')
const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
  partials: ['CHANNEL'],
})

const Redis = REDIS_HOST ? require('ioredis') : require('ioredis-mock')
const redis = REDIS_HOST ? new Redis(6379, REDIS_HOST) : new Redis(6379)
const gtts = require('gtts')
const fs = require('fs')
const striptags = require('striptags')
const { remind } = require('./remind')
const crisisClient = require('./crisisClient')
const giphyClient = require('./giphyClient')
const { toggleCrisisReportingActivated } = require('./cronJobs')
const logger = require('./logger')

let mainTextChannel = null

function initBot() {
  logger('Bot initializing...')
  client.login(BOT_SECRET_TOKEN)
}

eventbus.subscribe((msg) => {
  mainTextChannel?.send(msg)
})

client.on('ready', () => {
  logger('Connected as', client.user.tag)
})

client.on('messageCreate', async (msg) => {
  if (!msg.content.startsWith('!')) {
    return
  }
  const [cmdString, ...args] = msg.content.split(' ')
  const command = commandMap.get(cmdString)
  if (command) {
    const response = await command(msg, args)
    msg.reply(response)
  }
})
client.on('disconnect', () => {
  console.log('Disconnected ' + client.user.tag)
})
client.on('error', (error) => {
  console.log('Horrible error', error)
})

const commandMap = new Map([
  ['!ping', () => 'pong!'],
  ['!utbud', commandList],
  ['!apod', apod],
  ['!rulla', roll],
  ['!rullsnitt', rollAvg],
  ['!rulltot', rollTot],
  ['!korv', korv],
  ['!banan', banan],
  ['!kris', crisis],
  ['!corona', corona],
  ['!aktaHunden', aktaHunden],
  ['!förolämpa', insult],
  ['!påminn', remind],
  ['!predika', preach],
  ['!krisa', toggleCrisis],
])

function toggleCrisis() {
  const isActivated = toggleCrisisReportingActivated()
  return `Krisrapportering ${
    !isActivated ? 'in' : ''
  }aktiverad beep boop beep :robot:`
}

async function crisis() {
  const crisers = await crisisClient.feed()
  if (!crisers.length) {
    return 'var inte orolig, allt är ok :thumbsup:'
  }
  return '\n\n' + crisisClient.render(crisers)
}

async function apod() {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
  const response = await fetch(url)
  const json = await response.json()
  const mediaUrl = json.media_type === 'video' ? json.url : json.hdurl
  return mediaUrl + `\n${json.explanation}`
}

function commandList() {
  let output = []
  for (const key of commandMap.keys()) {
    output.push(key)
  }
  return `\n${output.join('\n')}`
}

async function corona(_, args) {
  const country = args.join(' ') || 'Sweden'
  const response = await fetch(
    'https://corona.lmao.ninja/v3/covid-19/countries',
  )
  const json = await response.json()
  const data = json.find(
    (x) => x.country.toLowerCase() === country.toLowerCase(),
  )
  if (!data) {
    return `Hittade inget data för ${country}`
  }
  return `
  COVID-19 data just nu **${country}**
  Fall: **${data.cases}**
  Nya fall idag: **${data.todayCases}**
  Dödsfall: **${data.deaths}**
  Dödsfall idag: **${data.todayDeaths}**
  Tillfrisknade: **${data.recovered}**
  Kritiskt tillstånd: **${data.critical}**`
}

async function roll({ author }, args) {
  const result = (max) =>
    Math.floor(Math.random() * (Math.floor(max) - 1 + 1) + 1)
  const sum = (acc, curr) => acc + curr

  if (args.length === 0) {
    const roll = result(20)
    await redis.sadd(`rolls/${author.id}`, roll)
    if (roll === 20) {
      return 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fs-media-cache-ak0.pinimg.com%2F736x%2Ffa%2F3a%2F08%2Ffa3a08031e524a4c6efa131c91078b6f.jpg&f=1&nofb=1'
    }

    if (roll === 1) {
      return 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fih1.redbubble.net%2Fimage.280065502.4484%2Fflat%2C800x800%2C075%2Cf.jpg&f=1&nofb=1'
    }

    return `Grattis, du fick **${roll}**
Man kan också
*!rulla d20*
*!rulla 2d10*
*!rulla 4d6+15*`
  }

  const rolls = [...Array(parseInt(args[0].split('d')[0] || 1)).keys()]
  const dice = args[0].split('d')[1].split('+')[0]
  const extra = parseInt(args[0].split('+')[1] || 0)

  const roll = async (dice, rolls, extra) => {
    const nat = rolls.map(() => result(dice))
    const total = nat.reduce(sum, extra)
    await redis.sadd(`rolls/${author.id}`, total)
    return `
${nat.length > 1 || extra > 0 ? nat.join(' + ') : ''}${
      extra > 0 ? ` *+ ${extra}*` : ''
    }${nat.length > 1 || extra > 0 ? '\n' : ''}**${total}**`
  }

  return roll(dice, rolls, extra)
}

async function rollAvg({ author }) {
  try {
    const rolls = await redis.smembers(`rolls/${author.id}`)
    const totalRollsValue = rolls.reduce((p, c) => p + parseInt(c, 10), 0)
    const avg = totalRollsValue / rolls.length
    return `du har rullat ${avg.toFixed(2).toString()} i snitt`
  } catch (error) {
    console.log(error)
    return 'kunde inte får främ din snitt :('
  }
}

async function rollTot({ author }) {
  try {
    const rolls = await redis.smembers(`rolls/${author.id}`)
    return `du har rullat ${rolls.length} gånger`
  } catch (error) {
    console.log(error)
    return 'kunde inte ta fram dina totalt antal rullningar :('
  }
}

async function korv() {
  return await giphyClient.getRandom('sausage')
}

function banan() {
  return 'https://media-manager.starsinsider.com/1920/na_5bb4c827ef441.jpg'
}

async function aktaHunden() {
  const response = await fetch(
    'https://loremflickr.com/470/333/beware%20of%20dog',
  )
  if (Math.floor(Math.random() * (20 - 1 + 1) + 1) === 20) {
    return 'https://i.redd.it/0vw4wx5x9ng41.gif'
  } else {
    return response.url
  }
}

async function insult(message) {
  if (!message.member.voiceChannel) {
    return `joina en snackchatt så kommer jag`
  }

  const response = await fetch(
    'https://evilinsult.com/generate_insult.php?lang=en&type=json',
  )
  const json = await response.json()
  const tts = new gtts(json.insult, 'en')
  const tmpAudio = `./${Date.now()}.mp3`
  tts.save(tmpAudio, (err) => {
    if (err) {
      console.error(err)
    }
  })
  const connection = await message.member.voiceChannel.join()
  const dispatcher = connection.playFile(tmpAudio)

  dispatcher.on('end', () => {
    fs.unlink(tmpAudio, (err) => {
      if (err) {
        console.error('raspberry pi disk about to fill up. kill charky', err)
      }
    })
    dispatcher.destroy()
    message.member.voiceChannel.leave()
  })

  dispatcher.on('error', console.error)

  return `ses i ${message.member.voiceChannel.name}`
}

async function preach(message) {
  if (!message.member.voice.channel) {
    return `gud vår heliga herre kan bara predika sin lära om du joinar en snackchatt`
  }

  const response = await fetch(
    'https://api.scripture.api.bible/v1/bibles/fa4317c59f0825e0-01/passages/MAT.10.31',
    {
      headers: {
        'api-key': BIBLE_API_KEY,
      },
    },
  )
  const json = await response.json()
  const { content } = json.data
  const textContent = striptags(content).replace(/\d+/g, '')

  const tts = new gtts(`${textContent}, amen`, 'sv')
  const tmpAudio = `./${Date.now()}.mp3`
  tts.save(tmpAudio, (err) => {
    if (err) {
      console.error(err)
    }
  })
  const connection = await message.member.voiceChannel.join()
  const dispatcher = connection.playFile(tmpAudio)

  dispatcher.on('end', () => {
    fs.unlink(tmpAudio, (err) => {
      if (err) {
        console.error('raspberry pi disk about to fill up. kill charky', err)
      }
    })
    dispatcher.destroy()
    message.member.voiceChannel.leave()
  })

  dispatcher.on('error', console.error)

  return `predikar guds heliga lära i ${message.member.voiceChannel.name}`
}

module.exports = initBot
