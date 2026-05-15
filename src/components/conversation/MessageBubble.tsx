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
        <mark key={i} className="bg-amber-100 text-amber-800 rounded px-1 py-0.5 font-semibold not-italic mx-0.5">
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
    <div className={cn('flex items-end gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Sofía avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
          S
        </div>
      )}

      <div className={cn('flex flex-col gap-1 max-w-[78%] sm:max-w-[70%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-3 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-br-sm'
              : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-100'
          )}
        >
          {message.isStreaming && !message.content ? (
            <span className="flex items-center gap-1.5 py-0.5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          ) : (
            <>
              {isUser ? message.content : renderWithVocab(message.content)}
              {message.isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-current ml-1 animate-pulse align-middle" />
              )}
            </>
          )}
        </div>

        {/* Translation toggle */}
        {!isUser && !message.isStreaming && message.content && (
          <button
            onClick={() => setShowTranslation(v => !v)}
            className="text-[11px] text-slate-400 hover:text-indigo-500 transition-colors px-1 py-1 -mt-0.5"
          >
            {showTranslation ? 'Hide translation' : 'Show translation'}
          </button>
        )}
        {showTranslation && message.translation && (
          <p className="text-xs text-slate-500 italic px-1">{message.translation}</p>
        )}
      </div>
    </div>
  )
}
