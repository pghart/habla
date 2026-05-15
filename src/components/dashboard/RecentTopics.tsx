import Link from 'next/link'
import type { RecentTopic } from '@/types'

export function RecentTopics({ topics }: { topics: RecentTopic[] }) {
  if (topics.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Recent topics</p>
      <div className="flex flex-wrap gap-2">
        {topics.map(t => (
          <Link
            key={t.sessionId}
            href={`/conversation/${t.sessionId}`}
            className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors"
          >
            {t.topic}
          </Link>
        ))}
      </div>
    </div>
  )
}
