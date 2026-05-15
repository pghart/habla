'use client'

import { Spinner } from '@/components/ui/Spinner'

interface TTSPlayerProps {
  isPlaying: boolean
  isLoading: boolean
  onPause: () => void
  onResume: () => void
}

export function TTSPlayer({ isPlaying, isLoading, onPause, onResume }: TTSPlayerProps) {
  if (!isLoading && !isPlaying) return null

  return (
    <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 rounded-full pl-2.5 pr-1 py-1">
      {isLoading ? (
        <>
          <Spinner className="w-3 h-3" />
          <span className="pr-1.5">Preparing…</span>
        </>
      ) : (
        <>
          <span className="flex gap-0.5 items-center">
            {[6, 10, 8].map((h, i) => (
              <span
                key={i}
                className="w-0.5 bg-indigo-400 rounded-full animate-pulse"
                style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
          <span>Playing</span>
          <button
            onClick={onPause}
            className="ml-0.5 px-2.5 py-1.5 rounded-full hover:bg-indigo-100 font-semibold transition-colors min-w-[44px] text-center"
          >
            Pause
          </button>
        </>
      )}
    </div>
  )
}
