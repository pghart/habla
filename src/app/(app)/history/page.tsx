'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDuration } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

interface SessionSummary {
  id: string
  topic: string
  topicSlug: string
  startedAt: string
  endedAt: string | null
  durationSec: number
  _count: { messages: number }
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => { setSessions(data); setLoading(false) })
  }, [])

  return (
    <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">History</h1>
      <p className="text-sm text-slate-400 mb-6">Resume a past session or review what you covered.</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-6 h-6 text-indigo-400" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mx-auto mb-4">📚</div>
          <p className="text-slate-600 font-medium">No conversations yet</p>
          <p className="text-slate-400 text-sm mt-1">Start your first practice session</p>
          <Link href="/conversation" className="inline-block mt-4 bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
            Start practicing
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map(s => (
            <Link
              key={s.id}
              href={`/conversation/${s.id}`}
              className="block bg-white border border-slate-100 rounded-2xl px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-800 truncate">{s.topic}</span>
                <span className="text-xs text-slate-400 shrink-0">
                  {new Date(s.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-400">{s._count.messages} messages</span>
                {s.durationSec > 0 && (
                  <>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">{formatDuration(s.durationSec)}</span>
                  </>
                )}
                <span className="text-slate-200">·</span>
                <span className="text-xs text-indigo-500 font-medium">Resume →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
