'use client'

import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from '@/types'

interface UseConversationReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  sendMessage: (text: string) => Promise<string>
  setInitialMessages: (msgs: ChatMessage[]) => void
}

export function useConversation(sessionId: string): UseConversationReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const idCounter = useRef(0)

  const setInitialMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs)
  }, [])

  const sendMessage = useCallback(
    async (text: string): Promise<string> => {
      const userMsg: ChatMessage = {
        id: `local-${++idCounter.current}`,
        role: 'USER',
        content: text,
        createdAt: new Date().toISOString(),
      }

      const assistantId = `local-${++idCounter.current}`
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: 'ASSISTANT',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      }

      setMessages(prev => [...prev, userMsg, assistantPlaceholder])
      setIsStreaming(true)

      let fullText = ''

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message: text }),
        })

        if (!response.ok || !response.body) {
          throw new Error('Chat request failed')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') break
            try {
              const { text: delta, error } = JSON.parse(raw)
              if (error) throw new Error(error)
              if (delta) {
                fullText += delta
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, content: fullText, isStreaming: true }
                      : m
                  )
                )
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } finally {
        setIsStreaming(false)
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: fullText, isStreaming: false } : m
          )
        )
      }

      return fullText
    },
    [sessionId]
  )

  return { messages, isStreaming, sendMessage, setInitialMessages }
}
