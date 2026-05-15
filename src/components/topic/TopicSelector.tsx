'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/Spinner'
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

export function TopicSelector() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function selectTopic(topic: Topic) {
    setLoading(topic.slug)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.label, topicSlug: topic.slug }),
      })
      const { id } = await res.json()
      router.push(`/conversation/${id}`)
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Start a conversation</h2>
        <p className="text-sm text-slate-500 mt-1">Choose a topic and Sofía will guide you through it.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOPICS.map(topic => {
          const isLoading = loading === topic.slug
          return (
            <button
              key={topic.slug}
              onClick={() => selectTopic(topic)}
              disabled={!!loading}
              className="group bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-indigo-300 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="text-3xl block mb-2.5">{topic.icon}</span>
              <span className="flex items-center gap-1.5">
                <span className="block text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug">
                  {isLoading ? 'Starting…' : topic.label}
                </span>
                {isLoading && <Spinner className="w-3 h-3 text-indigo-500 shrink-0" />}
              </span>
              <span className="block text-xs text-slate-400 mt-0.5 leading-snug">{topic.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
