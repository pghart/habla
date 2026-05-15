export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type Role = 'USER' | 'ASSISTANT'

export interface ChatMessage {
  id: string
  role: Role
  content: string
  translation?: string | null
  createdAt: string
  isStreaming?: boolean
}

export interface Session {
  id: string
  topic: string
  topicSlug: string
  startedAt: string
  endedAt?: string | null
  durationSec: number
  messages: ChatMessage[]
}

export interface Topic {
  slug: string
  label: string
  icon: string
  description: string
}

export interface RecentTopic {
  topic: string
  topicSlug: string
  sessionId: string
}

export interface ProgressStats {
  streak: number
  totalMinutes: number
  weeklyMinutes: number[]
  recentTopics: RecentTopic[]
  level: Level
}

export interface UserSummary {
  id: string
  username: string
  displayName: string
  level: Level
  isAdmin: boolean
  createdAt: string
}
