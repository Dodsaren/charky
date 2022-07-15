import type { CommandModule } from '../types'
import giphyClient from '../../giphyClient'

const sausage: CommandModule = {
  command: '!korv',
  execute: () => giphyClient.getRandom('sausage'),
}

export default sausage
