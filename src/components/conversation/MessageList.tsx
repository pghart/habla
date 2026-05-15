'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import type { ChatMessage } from '@/types'

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
      {messages.length === 0 && (
        <div className="text-center text-slate-400 text-sm mt-12">
          <p className="text-4xl mb-3">💬</p>
          <p>Start the conversation — type or use the mic below.</p>
          <p className="text-xs mt-1 text-slate-300">Sofía is ready to practice with you.</p>
        </div>
      )}
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
