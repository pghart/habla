export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const ALLOWED_STYLES = ['CONVERSATION', 'DRILLS', 'IMMERSION']

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, displayName: true, level: true, teachingStyle: true, isAdmin: true },
  })

  return Response.json(user)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { level, teachingStyle } = await req.json()
  const data: Record<string, unknown> = {}

  if (level) {
    if (!ALLOWED_LEVELS.includes(level)) {
      return Response.json({ error: 'Invalid level' }, { status: 400 })
    }
    data.level = level
  }
  if (teachingStyle) {
    if (!ALLOWED_STYLES.includes(teachingStyle)) {
      return Response.json({ error: 'Invalid teaching style' }, { status: 400 })
    }
    data.teachingStyle = teachingStyle
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, level: true, teachingStyle: true },
  })

  return Response.json(user)
}
