export function RecentTopics({ topics }: { topics: string[] }) {
  if (topics.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-700 mb-3">Recent topics</p>
      <div className="flex flex-wrap gap-2">
        {topics.map(topic => (
          <span key={topic} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
            {topic}
          </span>
        ))}
      </div>
    </div>
  )
}
