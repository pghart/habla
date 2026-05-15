import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConfigOrEnv, CONFIG_KEYS } from '@/lib/config'

export async function POST(req: Request, { params }: { params: { service: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { service } = params

  try {
    switch (service) {
      case 'anthropic':
        return testAnthropic()
      case 'openai':
        return testOpenAI()
      case 'elevenlabs':
        return testElevenLabs()
      case 'elevenlabs-voice':
        return testElevenLabsVoice()
      default:
        return Response.json({ error: 'Unknown service' }, { status: 400 })
    }
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 200 })
  }
}

async function testAnthropic() {
  const apiKey = await getConfigOrEnv(CONFIG_KEYS.ANTHROPIC_API_KEY, 'ANTHROPIC_API_KEY')
  if (!apiKey) return Response.json({ ok: false, error: 'API key not set' })

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say "ok"' }],
    }),
  })

  if (res.ok) return Response.json({ ok: true, message: 'Anthropic connection successful' })

  const data = await res.json()
  return Response.json({ ok: false, error: data.error?.message ?? `HTTP ${res.status}` })
}

async function testOpenAI() {
  const apiKey = await getConfigOrEnv(CONFIG_KEYS.OPENAI_API_KEY, 'OPENAI_API_KEY')
  if (!apiKey) return Response.json({ ok: false, error: 'API key not set' })

  // Test via models endpoint — free, no tokens consumed
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (res.ok) return Response.json({ ok: true, message: 'OpenAI connection successful (Whisper + TTS ready)' })

  const data = await res.json()
  return Response.json({ ok: false, error: data.error?.message ?? `HTTP ${res.status}` })
}

async function testElevenLabs() {
  const apiKey = await getConfigOrEnv(CONFIG_KEYS.ELEVENLABS_API_KEY, 'ELEVENLABS_API_KEY')
  if (!apiKey) return Response.json({ ok: false, error: 'API key not set' })

  const res = await fetch('https://api.elevenlabs.io/v1/user', {
    headers: { 'xi-api-key': apiKey },
  })

  if (res.ok) {
    const data = await res.json()
    const used = data.subscription?.character_count ?? 0
    const limit = data.subscription?.character_limit ?? 0
    return Response.json({
      ok: true,
      message: `ElevenLabs connected — ${used.toLocaleString()} / ${limit.toLocaleString()} characters used this month`,
    })
  }

  const data = await res.json()
  return Response.json({ ok: false, error: data.detail?.message ?? `HTTP ${res.status}` })
}

async function testElevenLabsVoice() {
  const apiKey = await getConfigOrEnv(CONFIG_KEYS.ELEVENLABS_API_KEY, 'ELEVENLABS_API_KEY')
  const voiceId = await getConfigOrEnv(CONFIG_KEYS.ELEVENLABS_VOICE_ID, 'ELEVENLABS_VOICE_ID')

  if (!apiKey) return Response.json({ ok: false, error: 'ElevenLabs API key not set' })
  if (!voiceId) return Response.json({ ok: false, error: 'Voice ID not set' })

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hola, me llamo Sofía.',
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  if (res.ok) {
    // Return the audio so the settings page can play it
    return new Response(res.body, { headers: { 'Content-Type': 'audio/mpeg' } })
  }

  return Response.json({ ok: false, error: `HTTP ${res.status} — check your Voice ID` })
}
