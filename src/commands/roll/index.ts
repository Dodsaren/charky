import type { CommandModule } from '../types'
import redisClient from '../../services/redisClient'

const roll: CommandModule = {
  command: '!rulla',
  execute: async ({ author }, args): Promise<string> => {
    const result = (max: number) =>
      Math.floor(Math.random() * (Math.floor(max) - 1 + 1) + 1)
    const sum = (acc: number, curr: number) => acc + curr

    if (args.length === 0) {
      const roll = result(20)
      await redisClient.sadd(`rolls/${author.id}`, roll)
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
      await redisClient.sadd(`rolls/${author.id}`, total)
      return `${nat.length > 1 || extra > 0 ? nat.join(' + ') : ''}${
        extra > 0 ? ` *+ ${extra}*` : ''
      }${nat.length > 1 || extra > 0 ? '\n' : ''}**${total}**`
    }
    return roll(dice, rolls, extra)
  },
}

export default roll
