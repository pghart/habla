export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { todayUtcMidnight } from '@/lib/utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const today = todayUtcMidnight()
  const dayMs = 86400000
  const thirtyDaysAgo = new Date(today.getTime() - 29 * dayMs)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      level: true,
      progress: {
        where: { date: { gte: thirtyDaysAgo } },
        select: { date: true, minutesPracticed: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const members = users.map(u => {
    let streak = 0
    for (let i = 0; i <= 30; i++) {
      const check = new Date(today.getTime() - i * dayMs)
      const found = u.progress.find(p => new Date(p.date).getTime() === check.getTime())
      if (found && found.minutesPracticed > 0) streak++
      else if (i > 0) break
    }
    const totalMinutes = u.progress.reduce((sum, p) => sum + p.minutesPracticed, 0)
    return {
      id: u.id,
      displayName: u.displayName,
      level: u.level,
      streak,
      totalMinutes,
      isMe: u.id === session.user.id,
    }
  })

  // Sort: highest streak first, then highest minutes
  members.sort((a, b) => b.streak - a.streak || b.totalMinutes - a.totalMinutes)

  return Response.json(members)
}
