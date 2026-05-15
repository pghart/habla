export function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col justify-center dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl">{streak > 0 ? '🔥' : '💤'}</span>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{streak}</p>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
        {streak === 1 ? '1 day streak' : `${streak > 0 ? streak : 'No'} day streak`}
      </p>
      {streak === 0 && (
        <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5">Practice today to start one</p>
      )}
    </div>
  )
}
