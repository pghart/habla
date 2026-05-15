import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const extension = mimeType.includes('ogg') ? 'ogg' : 'webm'
  const file = new File([audioBuffer], `audio.${extension}`, { type: mimeType })

  const result = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'es',
    response_format: 'text',
  })

  return result as unknown as string
}
