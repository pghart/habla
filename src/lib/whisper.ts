import OpenAI from 'openai'
import { getConfigOrEnv, CONFIG_KEYS } from './config'

async function getOpenAIClient(): Promise<OpenAI> {
  const apiKey = await getConfigOrEnv(CONFIG_KEYS.OPENAI_API_KEY, 'OPENAI_API_KEY')
  if (!apiKey) throw new Error('OpenAI API key not configured. Set it in Admin → Settings.')
  return new OpenAI({ apiKey })
}

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const openai = await getOpenAIClient()
  const extension = mimeType.includes('ogg') ? 'ogg' : 'webm'
  const file = new File([new Uint8Array(audioBuffer)], `audio.${extension}`, { type: mimeType })

  const result = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'es',
    response_format: 'text',
  })

  return result as unknown as string
}
