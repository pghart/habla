export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnthropicClient } from '@/lib/claude'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()
  if (!text || typeof text !== 'string') {
    return Response.json({ error: 'Missing text' }, { status: 400 })
  }

  try {
    const anthropic = await getAnthropicClient()
    const result = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system:
        'Translate the user\'s message into natural conversational English. ' +
        'If parts are already in English, leave them as-is. Strip any **double-asterisk** markers but keep the words. ' +
        'Output ONLY the translation — no preamble, no quotes, no explanation.',
      messages: [{ role: 'user', content: text }],
    })

    const translation = result.content
      .filter(b => b.type === 'text')
      .map(b => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim()

    return Response.json({ translation })
  } catch {
    return Response.json({ error: 'Translation failed' }, { status: 500 })
  }
}
