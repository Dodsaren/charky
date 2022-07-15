import type { CommandModule } from '../types'
import fetch from 'node-fetch'
import striptags from 'striptags'
import voiceClient from '../../services/voiceClient'

const { BIBLE_API_KEY } = process.env
const preach: CommandModule = {
  command: '!predika',
  execute: async (msg) => {
    if (!msg.guild || !BIBLE_API_KEY) {
      return 'Det här kommer inte att fungera utan servern'
    }
    const member = await msg.guild.members.fetch(msg.author.id)
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
    const text = striptags(content).replace(/\d+/g, '')
    voiceClient.joinChannelAndPlay(
      text,
      {
        channelId: member.voice.channel.id,
        guildId: msg.guild.id,
        adapterCreator: msg.guild.voiceAdapterCreator,
      },
      { lang: 'sv' },
    )
    return `predikar guds heliga lära i ${msg.member?.voice.channel?.name}`
  },
}

export default preach
