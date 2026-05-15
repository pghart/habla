export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, displayName: true, level: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return Response.json(users)
}

export async function POST(req: Request) {
  const count = await prisma.user.count()

  // Allow first user (setup) without auth; all subsequent need admin auth
  if (count > 0) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { username, displayName, password, level, isAdmin } = await req.json()

  if (!username || !displayName || !password) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return Response.json({ error: 'Username already taken' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const isFirstUser = count === 0

  const user = await prisma.user.create({
    data: {
      username,
      displayName,
      passwordHash,
      level: level ?? 'BEGINNER',
      isAdmin: isFirstUser ? true : (isAdmin ?? false),
    },
    select: { id: true, username: true, displayName: true, level: true, isAdmin: true, createdAt: true },
  })

  return Response.json(user, { status: 201 })
}
