import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConfig, setConfig, deleteConfig, maskSecret, CONFIG_KEYS } from '@/lib/config'

const ALLOWED_KEYS = Object.values(CONFIG_KEYS)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const result: Record<string, string | null> = {}
  for (const key of ALLOWED_KEYS) {
    const value = await getConfig(key)
    // Return masked value so the UI can show "key is set" without exposing it
    result[key] = value ? maskSecret(value) : null
  }

  return Response.json(result)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(key as typeof ALLOWED_KEYS[number])) continue
    if (value === '' || value === null) {
      await deleteConfig(key)
    } else if (typeof value === 'string') {
      await setConfig(key, value)
    }
  }

  return Response.json({ ok: true })
}
