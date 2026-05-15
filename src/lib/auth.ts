import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { Level, TeachingStyle } from '@/types'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.displayName,
          email: null,
          isAdmin: user.isAdmin,
          level: user.level as Level,
          teachingStyle: (user.teachingStyle ?? 'CONVERSATION') as TeachingStyle,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.level = user.level
        token.teachingStyle = user.teachingStyle
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.isAdmin = token.isAdmin
      session.user.level = token.level
      session.user.teachingStyle = token.teachingStyle
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
