'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Topic } from '@/types'

export const TOPICS: Topic[] = [
  { slug: 'market', label: 'At the Market', icon: '🛒', description: 'Shopping, prices, and haggling' },
  { slug: 'family', label: 'Family Life', icon: '👨‍👩‍👧', description: 'Relatives, home, daily routines' },
  { slug: 'food', label: 'Food & Restaurants', icon: '🌮', description: 'Ordering, cooking, street food' },
  { slug: 'directions', label: 'Getting Around', icon: '🗺️', description: 'Directions, transport, navigation' },
  { slug: 'weather', label: 'Small Talk', icon: '☁️', description: 'Weather, greetings, casual chat' },
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
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Start a conversation</h2>
      <p className="text-sm text-slate-500 mb-6">Pick a topic and Sofía will guide you through it.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOPICS.map(topic => (
          <button
            key={topic.slug}
            onClick={() => selectTopic(topic)}
            disabled={!!loading}
            className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-400 hover:shadow-sm transition-all disabled:opacity-60 group"
          >
            <span className="text-2xl block mb-2">{topic.icon}</span>
            <span className="block text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">
              {loading === topic.slug ? 'Starting...' : topic.label}
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">{topic.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
