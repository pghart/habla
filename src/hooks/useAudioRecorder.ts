'use client'

import { useState, useRef, useCallback } from 'react'

type RecorderState = 'idle' | 'requesting' | 'ready' | 'recording' | 'processing' | 'error'

interface UseAudioRecorderReturn {
  state: RecorderState
  requestPermission: () => Promise<void>
  startRecording: () => void
  stopRecording: () => void
  errorMessage: string
}

export function useAudioRecorder(
  onTranscript: (transcript: string) => void
): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const requestPermission = useCallback(async () => {
    setState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setState('ready')
    } catch {
      setErrorMessage('Microphone access denied')
      setState('error')
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
      ? 'audio/ogg;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(streamRef.current, { mimeType })
    recorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = async () => {
      setState('processing')
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const formData = new FormData()
      formData.append('audio', blob, `audio.${mimeType.includes('ogg') ? 'ogg' : 'webm'}`)

      try {
        const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.transcript) {
          onTranscript(data.transcript)
        } else {
          setErrorMessage('Could not transcribe audio')
        }
      } catch {
        setErrorMessage('Transcription failed')
      }
      setState('ready')
    }

    recorder.start(250)
    setState('recording')
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop()
  }, [])

  return { state, requestPermission, startRecording, stopRecording, errorMessage }
}
