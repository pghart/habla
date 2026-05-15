import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Enable WAL mode for better concurrent read performance.
// PRAGMA returns a result row, so use $queryRawUnsafe (executeRaw rejects rows).
prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;').catch(() => {})

export default prisma
