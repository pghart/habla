import OpenAI from 'openai'
import { getConfigOrEnv, CONFIG_KEYS } from './config'

export async function generateSpeech(text: string): Promise<Response> {
  const provider = await getConfigOrEnv(CONFIG_KEYS.TTS_PROVIDER, 'TTS_PROVIDER') ?? 'openai'

  if (provider === 'elevenlabs') {
    return elevenLabsTTS(text)
  }
  return openaiTTS(text)
}

async function openaiTTS(text: string): Promise<Response> {
  const apiKey = await getConfigOrEnv(CONFIG_KEYS.OPENAI_API_KEY, 'OPENAI_API_KEY')
  if (!apiKey) throw new Error('OpenAI API key not configured. Set it in Admin → Settings.')

  const openai = new OpenAI({ apiKey })
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
    speed: 0.92,
  })

  return new Response(mp3.body, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}

async function elevenLabsTTS(text: string): Promise<Response> {
  const apiKey = await getConfigOrEnv(CONFIG_KEYS.ELEVENLABS_API_KEY, 'ELEVENLABS_API_KEY')
  const voiceId = await getConfigOrEnv(CONFIG_KEYS.ELEVENLABS_VOICE_ID, 'ELEVENLABS_VOICE_ID')

  if (!apiKey) throw new Error('ElevenLabs API key not configured. Set it in Admin → Settings.')
  if (!voiceId) throw new Error('ElevenLabs Voice ID not configured. Set it in Admin → Settings.')

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )

  return new Response(response.body, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}
