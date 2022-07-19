import type { CommandModule } from '../types'

const list: CommandModule = {
  command: '!list',
  execute: async () => {
    const { commandMap } = await import('../../bot')
    const commands = Array.from(commandMap.keys())
    return `\n${commands.join('\n')}`
  },
}

export default list
