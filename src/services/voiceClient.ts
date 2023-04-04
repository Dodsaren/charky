import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  CreateAudioResourceOptions,
  CreateVoiceConnectionOptions,
  joinVoiceChannel,
  JoinVoiceChannelOptions,
  StreamType,
} from '@discordjs/voice'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import discordTTS from 'discord-tts'

const voiceClient = {
  joinChannelAndPlay: (
    text: string,
    connectionOptions: JoinVoiceChannelOptions & CreateVoiceConnectionOptions,
    voiceStreamOptions: { lang: string } = { lang: 'en' },
    resourceOptions:
      | Omit<CreateAudioResourceOptions<null | undefined>, 'metadata'>
      | undefined = { inputType: StreamType.Arbitrary, inlineVolume: true },
  ) => {
    const stream = discordTTS.getVoiceStream(text, voiceStreamOptions)
    const resource = createAudioResource(stream, resourceOptions)
    const connection = joinVoiceChannel(connectionOptions)
    const player = createAudioPlayer()
    player.play(resource)
    connection.subscribe(player)
    player.on(AudioPlayerStatus.Idle, () => connection.destroy())
  },
}

export default voiceClient
