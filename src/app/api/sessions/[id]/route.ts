export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const conv = await prisma.conversationSession.findUnique({
    where: { id: params.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!conv || conv.userId !== session.user.id) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json(conv)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const conv = await prisma.conversationSession.findUnique({ where: { id: params.id } })
  if (!conv || conv.userId !== session.user.id) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.conversationSession.delete({ where: { id: params.id } })
  return Response.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const conv = await prisma.conversationSession.findUnique({ where: { id: params.id } })
  if (!conv || conv.userId !== session.user.id) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const { durationSec, endedAt } = await req.json()
  const data: Record<string, unknown> = {}
  if (typeof durationSec === 'number') data.durationSec = durationSec
  if (endedAt) data.endedAt = new Date(endedAt)

  const updated = await prisma.conversationSession.update({
    where: { id: params.id },
    data,
  })

  return Response.json(updated)
}
