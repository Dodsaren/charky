import type { CommandModule } from '../types'
import fetch from 'node-fetch'
import randomNumberSequence from '../../utils/randomNumberSequence'
import voiceClient from '../../services/voiceClient'

const insult: CommandModule = {
  command: '!förolämpa',
  execute: async (msg) => {
    if (!msg.guild) {
      return 'Det här kommer inte att fungera utan servern'
    }
    const member = await msg.guild?.members.fetch(msg.author.id)
    if (!member?.voice.channel) {
      return `joina en snackchatt så kommer jag`
    }
    const response = await fetch(
      `https://evilinsult.com/generate_insult.php?lang=en&type=json&_=${randomNumberSequence(
        8,
      )}`,
    )
    const json = await response.json()
    voiceClient.joinChannelAndPlay(json.insult, {
      channelId: member.voice.channel.id,
      guildId: msg.guild.id,
      adapterCreator: msg.guild.voiceAdapterCreator,
    })
    return `ses i ${member.voice.channel.name}`
  },
}

export default insult
