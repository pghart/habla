'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/Spinner'
import { formatDuration } from '@/lib/utils'
import type { Topic } from '@/types'

export const TOPICS: Topic[] = [
  { slug: 'market', label: 'At the Market', icon: '🛒', description: 'Shopping, prices, and haggling' },
  { slug: 'family', label: 'Family Life', icon: '👨‍👩‍👧', description: 'Relatives, home, daily routines' },
  { slug: 'food', label: 'Food & Restaurants', icon: '🌮', description: 'Ordering, cooking, street food' },
  { slug: 'directions', label: 'Getting Around', icon: '🗺️', description: 'Directions, transport, navigation' },
  { slug: 'weather', label: 'Small Talk', icon: '☀️', description: 'Weather, greetings, casual chat' },
  { slug: 'work', label: 'Work & Routines', icon: '💼', description: 'Jobs, schedules, responsibilities' },
  { slug: 'travel', label: 'Travel & Tourism', icon: '✈️', description: 'Hotels, sightseeing, planning' },
  { slug: 'health', label: 'Health & Body', icon: '🏥', description: 'Doctor visits, symptoms, wellness' },
  { slug: 'free', label: 'Free Conversation', icon: '💬', description: 'Talk about anything at all' },
]

interface SessionSummary {
  id: string
  topic: string
  topicSlug: string
  startedAt: string
  durationSec: number
  _count: { messages: number }
}

export function TopicSelector() {
  const router = useRouter()
  const [sessionsByTopic, setSessionsByTopic] = useState<Record<string, SessionSummary>>({})
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/sessions')
    const list: SessionSummary[] = await res.json()
    // Newest session per topicSlug (list is already ordered desc by startedAt)
    const map: Record<string, SessionSummary> = {}
    for (const s of list) {
      if (!map[s.topicSlug]) map[s.topicSlug] = s
    }
    setSessionsByTopic(map)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function selectTopic(topic: Topic) {
    setLoadingSlug(topic.slug)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.label, topicSlug: topic.slug }),
      })
      const { id } = await res.json()
      router.push(`/conversation/${id}`)
    } catch {
      setLoadingSlug(null)
    }
  }

  async function deleteSession(slug: string, label: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete your "${label}" conversation? This can't be undone.`)) return
    const sess = sessionsByTopic[slug]
    if (!sess) return
    setDeletingSlug(slug)
    const res = await fetch(`/api/sessions/${sess.id}`, { method: 'DELETE' })
    if (res.ok) {
      setSessionsByTopic(prev => {
        const next = { ...prev }
        delete next[slug]
        return next
      })
    }
    setDeletingSlug(null)
  }

  return (
    <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">Conversations</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pick a topic to start or resume.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOPICS.map(topic => {
          const sess = sessionsByTopic[topic.slug]
          const isLoading = loadingSlug === topic.slug
          const isDeleting = deletingSlug === topic.slug
          return (
            <div key={topic.slug} className="relative group">
              <button
                onClick={() => selectTopic(topic)}
                disabled={!!loadingSlug}
                className="w-full h-full bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-indigo-300 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500"
              >
                <span className="text-3xl block mb-2.5">{topic.icon}</span>
                <span className="flex items-center gap-1.5">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {isLoading ? 'Opening…' : topic.label}
                  </span>
                  {isLoading && <Spinner className="w-3 h-3 text-indigo-500 shrink-0" />}
                </span>
                {sess ? (
                  <span className="block text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                    {sess._count.messages} msg
                    {sess.durationSec > 0 && ` · ${formatDuration(sess.durationSec)}`} · Resume →
                  </span>
                ) : (
                  <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{topic.description}</span>
                )}
              </button>
              {sess && (
                <button
                  onClick={e => deleteSession(topic.slug, topic.label, e)}
                  disabled={isDeleting}
                  aria-label={`Delete ${topic.label} conversation`}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                >
                  {isDeleting ? (
                    <Spinner className="w-3 h-3" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
