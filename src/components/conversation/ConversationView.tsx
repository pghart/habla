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
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionStartRef = useRef(Date.now())

  useEffect(() => {
    setInitialMessages(initialMessages)
  }, [initialMessages, setInitialMessages])

  // Heartbeat to update session duration
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
      const seconds = Math.floor((Date.now() - sessionStartRef.current) / 1000)
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
    if (assistantText) {
      await playText(assistantText)
    }
  }, [isStreaming, sendMessage, playText])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputText)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topic header */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{topic}</h2>
          <p className="text-xs text-slate-400">Practicing with Sofía</p>
        </div>
        <TTSPlayer isPlaying={isPlaying} isLoading={ttsLoading} onPause={pause} onResume={resume} />
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input bar */}
      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="flex items-center gap-3">
          <AudioRecorder onTranscript={(t) => handleSend(t)} disabled={isStreaming} />
          <input
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type in Spanish or English..."
            disabled={isStreaming}
            className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || isStreaming}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
