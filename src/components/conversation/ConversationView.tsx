'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageList } from './MessageList'
import { AudioRecorder } from './AudioRecorder'
import { TTSPlayer } from './TTSPlayer'
import { useConversation } from '@/hooks/useConversation'
import { useTTS } from '@/hooks/useTTS'
import type { ChatMessage } from '@/types'

interface ConversationViewProps {
  sessionId: string
  topic: string
  initialMessages: ChatMessage[]
}

export function ConversationView({ sessionId, topic, initialMessages }: ConversationViewProps) {
  const { messages, isStreaming, sendMessage, setInitialMessages } = useConversation(sessionId)
  const { isPlaying, isLoading: ttsLoading, playText, pause, resume } = useTTS()
  const [inputText, setInputText] = useState('')
  const sessionStartRef = useRef(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInitialMessages(initialMessages)
  }, [initialMessages, setInitialMessages])

  // Heartbeat + cleanup
  useEffect(() => {
    const interval = setInterval(async () => {
      const seconds = Math.floor((Date.now() - sessionStartRef.current) / 1000)
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSec: seconds }),
      }).catch(() => {})
    }, 60000)

    return () => {
      clearInterval(interval)
      const startTime = sessionStartRef.current
      const seconds = Math.floor((Date.now() - startTime) / 1000)
      fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSec: seconds, endedAt: new Date().toISOString() }),
      }).catch(() => {})
    }
  }, [sessionId])

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return
    setInputText('')
    const assistantText = await sendMessage(text)
    if (assistantText) await playText(assistantText)
  }, [isStreaming, sendMessage, playText])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputText)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 bg-white border-b border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
            S
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">Sofía</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{topic}</p>
          </div>
        </div>
        <TTSPlayer isPlaying={isPlaying} isLoading={ttsLoading} onPause={pause} onResume={resume} />
      </div>

      {/* Messages */}
      <MessageList messages={messages} onReplay={playText} />

      {/* Input bar */}
      <div className="px-3 md:px-4 py-3 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <AudioRecorder onTranscript={t => handleSend(t)} disabled={isStreaming} />
          <input
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type in Spanish or English…"
            disabled={isStreaming}
            className="flex-1 min-w-0 bg-slate-100 border-0 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors disabled:opacity-60 placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-700 dark:placeholder:text-slate-500"
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || isStreaming}
            className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0 shadow-sm"
          >
            <svg className="w-4 h-4 text-white translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
