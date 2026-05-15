export function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{streak > 0 ? '🔥' : '💤'}</span>
        <p className="text-3xl font-bold text-slate-800">{streak}</p>
      </div>
      <p className="text-sm text-slate-500 mt-1">
        {streak === 1 ? 'Day streak' : 'Day streak'}
      </p>
      {streak === 0 && (
        <p className="text-xs text-slate-400 mt-1">Practice today to start one!</p>
      )}
    </div>
  )
}
