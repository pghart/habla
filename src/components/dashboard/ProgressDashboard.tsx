'use client'

import { useProgress } from '@/hooks/useProgress'
import { StreakCard } from './StreakCard'
import { MinutesChart } from './MinutesChart'
import { RecentTopics } from './RecentTopics'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'

export function ProgressDashboard() {
  const { stats, isLoading } = useProgress()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="w-8 h-8 text-indigo-500" />
      </div>
    )
  }

  const levelVariant = {
    BEGINNER: 'blue' as const,
    INTERMEDIATE: 'amber' as const,
    ADVANCED: 'green' as const,
  }[stats?.level ?? 'BEGINNER']

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Progress</h1>
          <p className="text-sm text-slate-500 mt-0.5">Keep the streak going — even 5 minutes counts.</p>
        </div>
        <Badge variant={levelVariant} className="text-sm px-3 py-1">
          {stats?.level?.charAt(0) + (stats?.level?.slice(1).toLowerCase() ?? '')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StreakCard streak={stats?.streak ?? 0} />
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-center">
          <p className="text-3xl font-bold text-indigo-700">{stats?.totalMinutes ?? 0}</p>
          <p className="text-sm text-slate-500 mt-1">Total minutes practiced</p>
        </div>
      </div>

      <MinutesChart data={stats?.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0]} />

      <RecentTopics topics={stats?.recentTopics ?? []} />

      <Link
        href="/conversation"
        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-medium py-3 rounded-xl text-sm transition-colors"
      >
        Start practicing now
      </Link>
    </div>
  )
}
