export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') ?? '1')
  const limit = parseInt(url.searchParams.get('limit') ?? '20')

  const sessions = await prisma.conversationSession.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true, topic: true, topicSlug: true,
      startedAt: true, endedAt: true, durationSec: true,
      _count: { select: { messages: true } },
    },
  })

  return Response.json(sessions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, topicSlug } = await req.json()
  if (!topic || !topicSlug) {
    return Response.json({ error: 'Missing topic' }, { status: 400 })
  }

  // One session per user+topic — resume if it exists, create otherwise
  const existing = await prisma.conversationSession.findFirst({
    where: { userId: session.user.id, topicSlug },
    select: { id: true },
  })
  if (existing) return Response.json(existing)

  const conv = await prisma.conversationSession.create({
    data: { userId: session.user.id, topic, topicSlug },
    select: { id: true },
  })

  return Response.json(conv, { status: 201 })
}
