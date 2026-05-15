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
    <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 rounded-full px-3 py-1">
      {isLoading ? (
        <>
          <Spinner className="w-3 h-3" />
          <span>Preparing audio...</span>
        </>
      ) : (
        <>
          <span className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-0.5 bg-indigo-500 rounded-full animate-pulse"
                style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </span>
          <span>Playing</span>
          <button onClick={onPause} className="hover:text-indigo-800 font-medium">Pause</button>
        </>
      )}
    </div>
  )
}
