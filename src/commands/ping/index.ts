import type { CommandModule } from '../types'

const ping: CommandModule = {
  command: '!ping',
  execute: () => 'pong!',
}

export default ping
