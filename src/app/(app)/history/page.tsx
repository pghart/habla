'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDuration } from '@/lib/utils'

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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Conversation History</h1>
      <p className="text-sm text-slate-500 mb-6">Resume a past session or review what you practiced.</p>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-slate-400 text-sm">No conversations yet.</p>
          <Link href="/conversation" className="text-indigo-600 text-sm hover:underline mt-2 block">
            Start your first one
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Link
              key={s.id}
              href={`/conversation/${s.id}`}
              className="block bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-indigo-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{s.topic}</span>
                <span className="text-xs text-slate-400">
                  {new Date(s.startedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-400">{s._count.messages} messages</span>
                {s.durationSec > 0 && (
                  <span className="text-xs text-slate-400">{formatDuration(s.durationSec)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
