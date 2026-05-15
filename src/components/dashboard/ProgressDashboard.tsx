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
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <Spinner className="w-8 h-8 text-indigo-400" />
      </div>
    )
  }

  const levelVariant = {
    BEGINNER: 'blue' as const,
    INTERMEDIATE: 'amber' as const,
    ADVANCED: 'green' as const,
  }[stats?.level ?? 'BEGINNER']

  const levelLabel = stats?.level
    ? stats.level.charAt(0) + stats.level.slice(1).toLowerCase()
    : 'Beginner'

  return (
    <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Your Progress</h1>
          <p className="text-sm text-slate-400 mt-0.5">Keep the streak going — even 5 minutes counts.</p>
        </div>
        <Badge variant={levelVariant} className="text-xs px-2.5 py-1 shrink-0 mt-1">{levelLabel}</Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StreakCard streak={stats?.streak ?? 0} />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col justify-center">
          <p className="text-3xl font-bold text-indigo-600">{stats?.totalMinutes ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Total minutes</p>
        </div>
      </div>

      <MinutesChart data={stats?.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0]} />

      {(stats?.recentTopics?.length ?? 0) > 0 && (
        <RecentTopics topics={stats!.recentTopics} />
      )}

      <Link
        href="/conversation"
        className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3.5 rounded-2xl text-sm transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        Start practicing
      </Link>

      <BuildFooter />
    </div>
  )
}

function BuildFooter() {
  const sha = process.env.NEXT_PUBLIC_GIT_SHA
  const date = process.env.NEXT_PUBLIC_BUILD_DATE
  if (!sha && !date) return null
  const formatted = date && date !== 'unknown'
    ? new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null
  return (
    <p className="text-[11px] text-slate-300 text-center pt-2">
      {formatted && <span>{formatted}</span>}
      {formatted && sha && sha !== 'unknown' && <span className="mx-1.5">·</span>}
      {sha && sha !== 'unknown' && <span className="font-mono">{sha}</span>}
    </p>
  )
}
