import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { displayName, level, isAdmin, password } = await req.json()
  const data: Record<string, unknown> = {}

  if (displayName) data.displayName = displayName
  if (level) data.level = level
  if (typeof isAdmin === 'boolean') {
    // Prevent removing own admin
    if (params.id === session.user.id && !isAdmin) {
      return Response.json({ error: 'Cannot remove your own admin access' }, { status: 400 })
    }
    data.isAdmin = isAdmin
  }
  if (password) data.passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, username: true, displayName: true, level: true, isAdmin: true, createdAt: true },
  })

  return Response.json(user)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  if (params.id === session.user.id) {
    return Response.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return new Response(null, { status: 204 })
}
