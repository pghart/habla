import type { DefaultSession } from 'next-auth'
import type { Level, TeachingStyle } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      level: Level
      teachingStyle: TeachingStyle
    } & DefaultSession['user']
  }

  interface User {
    id: string
    isAdmin: boolean
    level: Level
    teachingStyle: TeachingStyle
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    isAdmin: boolean
    level: Level
    teachingStyle: TeachingStyle
  }
}
