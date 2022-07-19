import { Client, Intents, Message, TextChannel } from 'discord.js'
import eventbus from './eventbus'
import logger from './logger'
import { readdirSync, statSync } from 'fs'
import path from 'path'
import { CommandModule } from './commands/types'

const { BOT_SECRET_TOKEN } = process.env

type Command = (msg: Message, args: string[]) => Promise<string> | string
export const commandMap = new Map<string, Command>()

// Load commands from default import in ./commands/*/index.ts
async function loadCommands() {
  const commandDirItems = readdirSync(path.join(__dirname + '/commands'))
  for (const item of commandDirItems) {
    if (statSync(path.join(__dirname, '/commands/', item)).isDirectory()) {
      const cmd: CommandModule = await import(
        path.join(__dirname, '/commands/', item, '/index.ts')
      ).then((x) => x?.default)
      if (cmd) {
        commandMap.set(cmd.command, cmd.execute)
      }
    }
  }
  console.log('commands registered', commandMap)
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  partials: ['CHANNEL'],
})
let mainTextChannels: TextChannel[] = []

eventbus.subscribe((msg) => {
  mainTextChannels.forEach((x) => x?.send(msg))
})

client.on('ready', async () => {
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
  // hur i hela h ska vi kolla dettta???
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

export default async () => {
  logger('Bot initializing...')
  await loadCommands()
  client.login(BOT_SECRET_TOKEN)
}
