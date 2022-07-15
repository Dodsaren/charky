import { Message } from 'discord.js'

export type CommandModule = {
  command: string
  execute: (msg: Message, args: string[]) => Promise<string> | string
}
