export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { todayUtcMidnight } from '@/lib/utils'
import type { ProgressStats } from '@/types'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  // Last 30 days of progress for streak + chart
  const thirtyDaysAgo = new Date(todayUtcMidnight())
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

  const progressRecords = await prisma.dailyProgress.findMany({
    where: { userId, date: { gte: thirtyDaysAgo } },
    orderBy: { date: 'asc' },
  })

  const today = todayUtcMidnight()

  // Compute streak
  let streak = 0
  const dayMs = 86400000
  for (let i = 0; i <= 30; i++) {
    const checkDate = new Date(today.getTime() - i * dayMs)
    const found = progressRecords.find(
      p => new Date(p.date).getTime() === checkDate.getTime()
    )
    if (found && found.minutesPracticed > 0) streak++
    else if (i > 0) break
  }

  // Weekly minutes (last 7 days, index 0 = 6 days ago, index 6 = today)
  const weeklyMinutes: number[] = []
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today.getTime() - i * dayMs)
    const record = progressRecords.find(p => new Date(p.date).getTime() === day.getTime())
    weeklyMinutes.push(record?.minutesPracticed ?? 0)
  }

  const totalMinutes = progressRecords.reduce((sum, p) => sum + p.minutesPracticed, 0)

  // Recent topics (last 5 unique)
  const recentSessions = await prisma.conversationSession.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: 20,
    select: { topic: true },
  })
  const recentTopics = Array.from(new Set(recentSessions.map(s => s.topic))).slice(0, 5)

  const stats: ProgressStats = {
    streak,
    totalMinutes,
    weeklyMinutes,
    recentTopics,
    level: session.user.level,
  }

  return Response.json(stats)
}
