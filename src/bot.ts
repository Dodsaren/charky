const { BOT_SECRET_TOKEN, BIBLE_API_KEY, REDIS_HOST } = process.env
import { Client, Intents, Message, TextChannel } from 'discord.js'
import fetch from 'node-fetch'
import eventbus from './eventbus'
import Redis from 'ioredis'
import RedisMock from 'ioredis-mock'
import striptags from 'striptags'
import giphyClient from './giphyClient'
import logger from './logger'
//@ts-ignore
import discordTTS from 'discord-tts'
import {
  createAudioResource,
  joinVoiceChannel,
  StreamType,
  createAudioPlayer,
  AudioPlayerStatus,
} from '@discordjs/voice'
import randomNumberSequence from './utils/randomNumberSequence'

type Command = (msg: Message, args: string[]) => Promise<string> | string

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  partials: ['CHANNEL'],
})
const redis = REDIS_HOST ? new Redis(6379, REDIS_HOST) : new RedisMock(6379)
let mainTextChannels: TextChannel[] = []
const commandMap = new Map<string, Command>()
commandMap.set('!ping', () => 'pong!')
commandMap.set('!list', commandList)
commandMap.set('!rulla', roll)
commandMap.set('!korv', korv)
commandMap.set('!förolämpa', insult)
commandMap.set('!predika', preach)

function initBot() {
  logger('Bot initializing...')
  client.login(BOT_SECRET_TOKEN)
}

eventbus.subscribe((msg) => {
  mainTextChannels.forEach((x) => x?.send(msg))
})

client.on('ready', () => {
  mainTextChannels = [...client.channels.cache.values()].filter(
    (x) => x.type === 'GUILD_TEXT' && x.rawPosition === 0,
  ) as TextChannel[]
  console.log(
    'main text channels registered:',
    mainTextChannels.map((x) => x.name).join(', '),
  )
  logger('Bot connected')
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
  console.log('Disconnected')
})
client.on('error', (error) => {
  console.log('Horrible error', error)
})

function commandList() {
  let output = []
  for (const key of commandMap.keys()) {
    output.push(key)
  }
  return `\n${output.join('\n')}`
}

async function roll({ author }: Message, args: string[]): Promise<string> {
  const result = (max: number) =>
    Math.floor(Math.random() * (Math.floor(max) - 1 + 1) + 1)
  const sum = (acc: number, curr: number) => acc + curr

  if (args.length === 0) {
    const roll = result(20)
    await redis.sadd(`rolls/${author.id}`, roll)
    if (roll === 20) {
      return 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fs-media-cache-ak0.pinimg.com%2F736x%2Ffa%2F3a%2F08%2Ffa3a08031e524a4c6efa131c91078b6f.jpg&f=1&nofb=1'
    }

    if (roll === 1) {
      return 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fih1.redbubble.net%2Fimage.280065502.4484%2Fflat%2C800x800%2C075%2Cf.jpg&f=1&nofb=1'
    }

    return `Grattis, du fick **${roll}** Man kan också *!rulla d20* *!rulla 2d10* *!rulla 4d6+15*`
  }

  const rolls = [...Array(parseInt(args[0].split('d')[0] || '1')).keys()]
  const dice = parseInt(args[0].split('d')[1].split('+')[0])
  const extra = parseInt(args[0].split('+')[1] || '0')

  const roll = async (dice: number, rolls: number[], extra: number) => {
    const nat = rolls.map(() => result(dice))
    const total = nat.reduce(sum, extra)
    await redis.sadd(`rolls/${author.id}`, total)
    return `${nat.length > 1 || extra > 0 ? nat.join(' + ') : ''}${
      extra > 0 ? ` *+ ${extra}*` : ''
    }${nat.length > 1 || extra > 0 ? '\n' : ''}**${total}**`
  }
  return roll(dice, rolls, extra)
}

async function korv(): Promise<string> {
  return await giphyClient.getRandom('sausage')
}

async function insult(message: Message): Promise<string> {
  if (!message.guild) {
    return 'Det här kommer inte att fungera utan servern'
  }
  const member = await message.guild?.members.fetch(message.author.id)
  if (!member?.voice.channel) {
    return `joina en snackchatt så kommer jag`
  }
  const response = await fetch(
    `https://evilinsult.com/generate_insult.php?lang=en&type=json&_=${randomNumberSequence(
      8,
    )}`,
  )
  const json = await response.json()
  const stream = discordTTS.getVoiceStream(json.insult, {
    lang: 'en',
  })
  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true,
  })
  const connection = joinVoiceChannel({
    channelId: member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  })
  const player = createAudioPlayer()
  player.play(resource)
  connection.subscribe(player)
  player.on(AudioPlayerStatus.Idle, () => connection.destroy())
  return `ses i ${member.voice.channel.name}`
}

async function preach(message: Message): Promise<string> {
  if (!message.guild || !BIBLE_API_KEY) {
    return 'Det här kommer inte att fungera utan servern'
  }
  const member = await message.guild.members.fetch(message.author.id)
  if (!member.voice.channel) {
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
  const stream = discordTTS.getVoiceStream(textContent, {
    lang: 'sv',
  })
  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true,
  })
  const connection = joinVoiceChannel({
    channelId: member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  })
  const player = createAudioPlayer()
  player.play(resource)
  connection.subscribe(player)
  player.on(AudioPlayerStatus.Idle, () => connection.destroy())
  return `predikar guds heliga lära i ${message.member?.voice.channel?.name}`
}

export default initBot
