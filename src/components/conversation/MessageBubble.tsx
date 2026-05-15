'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'

interface MessageBubbleProps {
  message: ChatMessage
}

function renderWithVocab(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const word = part.slice(2, -2)
      return (
        <mark key={i} className="bg-amber-100 text-amber-900 rounded px-0.5 font-medium not-italic">
          {word}
        </mark>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showTranslation, setShowTranslation] = useState(false)
  const isUser = message.role === 'USER'

  return (
    <div className={cn('flex items-start gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
          S
        </div>
      )}

      <div className={cn('max-w-[75%] space-y-1', isUser ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-sm'
          )}
        >
          {message.isStreaming && !message.content ? (
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          ) : (
            <>
              {isUser ? message.content : renderWithVocab(message.content)}
              {message.isStreaming && <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />}
            </>
          )}
        </div>

        {!isUser && message.translation && (
          <button
            onClick={() => setShowTranslation(v => !v)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors self-start ml-1"
          >
            {showTranslation ? 'Hide translation' : 'EN'}
          </button>
        )}
        {showTranslation && message.translation && (
          <p className="text-xs text-slate-500 italic ml-1">{message.translation}</p>
        )}
      </div>
    </div>
  )
}
