export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropicClient, buildSystemPrompt } from '@/lib/claude'
import { todayUtcMidnight } from '@/lib/utils'
import type { Level } from '@/types'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId, message } = await req.json()
  if (!sessionId || !message) {
    return Response.json({ error: 'Missing sessionId or message' }, { status: 400 })
  }

  const conv = await prisma.conversationSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: 'asc' }, take: 30 } },
  })

  if (!conv || conv.userId !== session.user.id) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  const level = session.user.level as Level
  const systemPrompt = buildSystemPrompt(level)

  const history = conv.messages.map(m => ({
    role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }))

  history.push({ role: 'user', content: message })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = ''

      try {
        const anthropic = await getAnthropicClient()
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 220,
          system: systemPrompt,
          messages: history,
        })

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullText += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`))
        controller.close()
        return
      }

      // Persist messages and update progress after stream closes
      try {
        await prisma.message.createMany({
          data: [
            { sessionId, role: 'USER', content: message },
            { sessionId, role: 'ASSISTANT', content: fullText },
          ],
        })

        const today = todayUtcMidnight()
        const existing = await prisma.dailyProgress.findUnique({
          where: { userId_date: { userId: session.user.id, date: today } },
        })

        const existingSlugs: string[] = existing ? JSON.parse(existing.topicsSlugs) : []
        const updatedSlugs = Array.from(new Set([...existingSlugs, conv.topicSlug]))

        await prisma.dailyProgress.upsert({
          where: { userId_date: { userId: session.user.id, date: today } },
          create: {
            userId: session.user.id,
            date: today,
            minutesPracticed: 1,
            sessionsCount: 1,
            topicsSlugs: JSON.stringify([conv.topicSlug]),
          },
          update: {
            minutesPracticed: { increment: 1 },
            topicsSlugs: JSON.stringify(updatedSlugs),
          },
        })
      } catch {
        // Progress update failure is non-fatal
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
