'use client'

import { useEffect } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

interface AudioRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function AudioRecorder({ onTranscript, disabled }: AudioRecorderProps) {
  const { state, requestPermission, startRecording, stopRecording } = useAudioRecorder(onTranscript)

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  const handleClick = () => {
    if (state === 'recording') {
      stopRecording()
    } else if (state === 'ready') {
      startRecording()
    } else if (state === 'idle' || state === 'error') {
      requestPermission()
    }
  }

  const isRecording = state === 'recording'
  const isProcessing = state === 'processing'

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing || state === 'requesting'}
      title={isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
      className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md',
        isRecording
          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : isProcessing
          ? 'bg-slate-300 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700'
      )}
    >
      {isProcessing ? (
        <Spinner className="w-5 h-5 text-white" />
      ) : isRecording ? (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      )}
    </button>
  )
}
