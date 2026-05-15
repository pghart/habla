import type { DefaultSession } from 'next-auth'
import type { Level } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      level: Level
    } & DefaultSession['user']
  }

  interface User {
    id: string
    isAdmin: boolean
    level: Level
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    isAdmin: boolean
    level: Level
  }
}
