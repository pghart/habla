export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSpeech } from '@/lib/tts'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()
  if (!text || typeof text !== 'string') {
    return Response.json({ error: 'No text provided' }, { status: 400 })
  }

  // Strip markdown bold markers before sending to TTS
  const plainText = text.replace(/\*\*(.*?)\*\*/g, '$1')

  return generateSpeech(plainText)
}
