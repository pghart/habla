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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => { setSessions(data); setLoading(false) })
  }, [])

  async function handleDelete(id: string, topic: string) {
    if (!confirm(`Delete "${topic}"? This can't be undone.`)) return
    setDeletingId(id)
    const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSessions(prev => prev.filter(s => s.id !== id))
    }
    setDeletingId(null)
  }

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
            <div
              key={s.id}
              className="group relative bg-white border border-slate-100 rounded-2xl hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <Link href={`/conversation/${s.id}`} className="block px-4 py-3.5 pr-12">
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
              <button
                onClick={() => handleDelete(s.id, s.topic)}
                disabled={deletingId === s.id}
                aria-label="Delete conversation"
                className="absolute top-1/2 -translate-y-1/2 right-3 w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
              >
                {deletingId === s.id ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
