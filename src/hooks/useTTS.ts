'use client'

import { useRef, useState, useCallback } from 'react'

interface UseTTSReturn {
  isPlaying: boolean
  isLoading: boolean
  playText: (text: string) => Promise<void>
  pause: () => void
  resume: () => void
}

export function useTTS(): UseTTSReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentUrlRef = useRef<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const playText = useCallback(async (text: string) => {
    if (!text.trim()) return
    setIsLoading(true)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.onplay = null
      audioRef.current.onpause = null
    }
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current)
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      currentUrlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio

      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      audio.onended = () => setIsPlaying(false)

      setIsLoading(false)
      await audio.play()
    } catch {
      setIsLoading(false)
    }
  }, [])

  const pause = useCallback(() => audioRef.current?.pause(), [])
  const resume = useCallback(() => audioRef.current?.play(), [])

  return { isPlaying, isLoading, playText, pause, resume }
}
