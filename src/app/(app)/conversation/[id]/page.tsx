import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ConversationView } from '@/components/conversation/ConversationView'
import type { ChatMessage } from '@/types'

export default async function ConversationSessionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const conv = await prisma.conversationSession.findUnique({
    where: { id: params.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!conv || conv.userId !== session.user.id) notFound()

  const initialMessages: ChatMessage[] = conv.messages.map(m => ({
    id: m.id,
    role: m.role as 'USER' | 'ASSISTANT',
    content: m.content,
    translation: m.translation,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <div className="h-full flex flex-col">
      <ConversationView
        sessionId={conv.id}
        topic={conv.topic}
        initialMessages={initialMessages}
      />
    </div>
  )
}
