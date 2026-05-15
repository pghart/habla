import crypto from 'crypto'
import { prisma } from './prisma'

// Config keys stored in the database
export const CONFIG_KEYS = {
  ANTHROPIC_API_KEY: 'anthropic_api_key',
  OPENAI_API_KEY: 'openai_api_key',
  TTS_PROVIDER: 'tts_provider',
  ELEVENLABS_API_KEY: 'elevenlabs_api_key',
  ELEVENLABS_VOICE_ID: 'elevenlabs_voice_id',
} as const

function getDerivedKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set')
  return crypto.createHash('sha256').update(secret).digest()
}

function encrypt(plaintext: string): string {
  const key = getDerivedKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // iv (12) + tag (16) + encrypted
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function decrypt(ciphertext: string): string {
  const key = getDerivedKey()
  const buf = Buffer.from(ciphertext, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export async function getConfig(key: string): Promise<string | null> {
  try {
    const record = await prisma.config.findUnique({ where: { key } })
    if (!record) return null
    return decrypt(record.value)
  } catch {
    return null
  }
}

export async function setConfig(key: string, value: string): Promise<void> {
  const encrypted = encrypt(value)
  await prisma.config.upsert({
    where: { key },
    create: { key, value: encrypted },
    update: { value: encrypted },
  })
}

export async function deleteConfig(key: string): Promise<void> {
  await prisma.config.deleteMany({ where: { key } })
}

// Read from DB first, fall back to environment variable
export async function getConfigOrEnv(dbKey: string, envKey: string): Promise<string | null> {
  const fromDb = await getConfig(dbKey)
  if (fromDb) return fromDb
  return process.env[envKey] ?? null
}

// Returns masked value for display (shows last 4 chars)
export function maskSecret(value: string): string {
  if (value.length <= 4) return '****'
  return '•'.repeat(Math.min(value.length - 4, 20)) + value.slice(-4)
}
