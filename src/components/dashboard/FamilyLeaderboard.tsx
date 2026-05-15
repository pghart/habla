'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface FamilyMember {
  id: string
  displayName: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  streak: number
  totalMinutes: number
  isMe: boolean
}

export function FamilyLeaderboard() {
  const [members, setMembers] = useState<FamilyMember[] | null>(null)

  useEffect(() => {
    fetch('/api/family')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setMembers(data))
      .catch(() => {})
  }, [])

  if (!members || members.length <= 1) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Family</p>
      <div className="space-y-1.5">
        {members.map((m, i) => (
          <div
            key={m.id}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg',
              m.isMe ? 'bg-indigo-50 dark:bg-indigo-950/60' : 'bg-slate-50 dark:bg-slate-800/50'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs text-slate-400 dark:text-slate-500 w-4 text-center font-medium">{i + 1}</span>
              <span
                className={cn(
                  'text-sm truncate',
                  m.isMe
                    ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300'
                )}
              >
                {m.displayName}
                {m.isMe && <span className="text-[10px] text-indigo-500 dark:text-indigo-400 ml-1.5">you</span>}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                🔥 {m.streak}
              </span>
              <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                {m.totalMinutes}m
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
