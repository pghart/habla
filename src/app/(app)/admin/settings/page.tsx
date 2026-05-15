'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

type TestStatus = 'idle' | 'testing' | 'ok' | 'error'

interface TestResultProps {
  status: TestStatus
  message: string
}

function TestResult({ status, message }: TestResultProps) {
  if (status === 'idle') return null
  if (status === 'testing') return <span className="text-xs text-slate-400 flex items-center gap-1"><Spinner className="w-3 h-3" /> Testing...</span>
  if (status === 'ok') return <span className="text-xs text-green-600 font-medium">✓ {message}</span>
  return <span className="text-xs text-red-500">✗ {message}</span>
}

interface ApiSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

function ApiSection({ title, description, children }: ApiSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-400 mt-0.5 mb-4">{description}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

interface KeyFieldProps {
  label: string
  value: string
  masked: string | null
  onChange: (v: string) => void
  onTest: () => void
  testStatus: TestStatus
  testMessage: string
  placeholder?: string
  testLabel?: string
  hint?: string
}

function KeyField({ label, value, masked, onChange, onTest, testStatus, testMessage, placeholder, testLabel = 'Test', hint }: KeyFieldProps) {
  const [reveal, setReveal] = useState(false)
  const hasStoredValue = masked !== null

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={reveal ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={hasStoredValue ? masked ?? undefined : placeholder}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
          />
          {(value || hasStoredValue) && (
            <button
              type="button"
              onClick={() => setReveal(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              {reveal ? 'hide' : 'show'}
            </button>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={onTest} disabled={testStatus === 'testing'}>
          {testStatus === 'testing' ? <Spinner className="w-3 h-3" /> : testLabel}
        </Button>
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {hasStoredValue && !value && (
        <p className="text-xs text-slate-400 mt-1">Stored: <span className="font-mono">{masked}</span></p>
      )}
      <div className="mt-1">
        <TestResult status={testStatus} message={testMessage} />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [stored, setStored] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [anthropicKey, setAnthropicKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [ttsProvider, setTtsProvider] = useState('openai')
  const [elevenKey, setElevenKey] = useState('')
  const [elevenVoiceId, setElevenVoiceId] = useState('')

  const [testStatus, setTestStatus] = useState<Record<string, TestStatus>>({})
  const [testMsg, setTestMsg] = useState<Record<string, string>>({})

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (session && !session.user.isAdmin) router.replace('/dashboard')
  }, [session, router])

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(data => {
        setStored(data)
        if (data.tts_provider) setTtsProvider(data.tts_provider)
        setLoading(false)
      })
  }, [])

  async function runTest(service: string) {
    setTestStatus(s => ({ ...s, [service]: 'testing' }))
    setTestMsg(m => ({ ...m, [service]: '' }))

    // Save any pending changes for the service being tested first
    await savePending()

    if (service === 'elevenlabs-voice') {
      const res = await fetch('/api/admin/test/elevenlabs-voice', { method: 'POST' })
      if (res.ok && res.headers.get('content-type')?.includes('audio')) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src) }
        audioRef.current = new Audio(url)
        audioRef.current.play()
        setTestStatus(s => ({ ...s, [service]: 'ok' }))
        setTestMsg(m => ({ ...m, [service]: 'Playing voice sample — "Hola, me llamo Sofía."' }))
      } else {
        const data = await res.json()
        setTestStatus(s => ({ ...s, [service]: 'error' }))
        setTestMsg(m => ({ ...m, [service]: data.error ?? 'Test failed' }))
      }
      return
    }

    const res = await fetch(`/api/admin/test/${service}`, { method: 'POST' })
    const data = await res.json()
    setTestStatus(s => ({ ...s, [service]: data.ok ? 'ok' : 'error' }))
    setTestMsg(m => ({ ...m, [service]: data.message ?? data.error ?? '' }))
  }

  async function savePending() {
    const payload: Record<string, string> = {}
    if (anthropicKey) payload.anthropic_api_key = anthropicKey
    if (openaiKey) payload.openai_api_key = openaiKey
    if (elevenKey) payload.elevenlabs_api_key = elevenKey
    if (elevenVoiceId) payload.elevenlabs_voice_id = elevenVoiceId
    payload.tts_provider = ttsProvider

    if (Object.keys(payload).length > 0) {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')

    const payload: Record<string, string> = { tts_provider: ttsProvider }
    if (anthropicKey) payload.anthropic_api_key = anthropicKey
    if (openaiKey) payload.openai_api_key = openaiKey
    if (elevenKey) payload.elevenlabs_api_key = elevenKey
    if (elevenVoiceId) payload.elevenlabs_voice_id = elevenVoiceId

    await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Refresh stored values
    const updated = await fetch('/api/admin/config').then(r => r.json())
    setStored(updated)
    setAnthropicKey('')
    setOpenaiKey('')
    setElevenKey('')
    setElevenVoiceId('')

    setSaving(false)
    setSaveMsg('Settings saved.')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spinner className="w-8 h-8 text-indigo-500" /></div>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">API Settings</h1>
      <p className="text-sm text-slate-500 mb-6">
        Keys are encrypted before being stored. Use the Test buttons to verify each connection before saving.
      </p>

      <form onSubmit={handleSave} className="space-y-5">
        <ApiSection
          title="Anthropic"
          description="Powers Sofía's conversation intelligence. Required."
        >
          <KeyField
            label="API Key"
            value={anthropicKey}
            masked={stored.anthropic_api_key}
            onChange={setAnthropicKey}
            onTest={() => runTest('anthropic')}
            testStatus={testStatus.anthropic ?? 'idle'}
            testMessage={testMsg.anthropic ?? ''}
            placeholder="sk-ant-..."
            hint="From console.anthropic.com → API Keys"
          />
        </ApiSection>

        <ApiSection
          title="OpenAI"
          description="Used for voice transcription (Whisper) and text-to-speech when TTS provider is set to OpenAI."
        >
          <KeyField
            label="API Key"
            value={openaiKey}
            masked={stored.openai_api_key}
            onChange={setOpenaiKey}
            onTest={() => runTest('openai')}
            testStatus={testStatus.openai ?? 'idle'}
            testMessage={testMsg.openai ?? ''}
            placeholder="sk-..."
            hint="From platform.openai.com → API Keys. Covers both Whisper and TTS."
          />
        </ApiSection>

        <ApiSection
          title="Text-to-Speech Provider"
          description="Choose which service reads Sofía's responses aloud."
        >
          <div className="flex gap-3">
            {['openai', 'elevenlabs'].map(p => (
              <label key={p} className={cn(
                'flex-1 flex items-center gap-2 border rounded-lg p-3 cursor-pointer text-sm transition-colors',
                ttsProvider === p ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}>
                <input type="radio" name="ttsProvider" value={p} checked={ttsProvider === p}
                  onChange={() => setTtsProvider(p)} className="sr-only" />
                <span className={cn('w-3 h-3 rounded-full border-2 shrink-0',
                  ttsProvider === p ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300')} />
                {p === 'openai' ? 'OpenAI TTS' : 'ElevenLabs'}
              </label>
            ))}
          </div>
        </ApiSection>

        <ApiSection
          title="ElevenLabs"
          description="Optional higher-quality TTS with stronger accent support. Only needed if TTS provider is set to ElevenLabs."
        >
          <KeyField
            label="API Key"
            value={elevenKey}
            masked={stored.elevenlabs_api_key}
            onChange={setElevenKey}
            onTest={() => runTest('elevenlabs')}
            testStatus={testStatus.elevenlabs ?? 'idle'}
            testMessage={testMsg.elevenlabs ?? ''}
            placeholder="your-elevenlabs-key"
            hint="From elevenlabs.io → Profile → API Keys"
          />
          <KeyField
            label="Voice ID"
            value={elevenVoiceId}
            masked={stored.elevenlabs_voice_id}
            onChange={setElevenVoiceId}
            onTest={() => runTest('elevenlabs-voice')}
            testStatus={testStatus['elevenlabs-voice'] ?? 'idle'}
            testMessage={testMsg['elevenlabs-voice'] ?? ''}
            placeholder="e.g. EXAVITQu4vr4xnSDxMaL"
            testLabel="Play sample"
            hint='From elevenlabs.io → Voices → My Voices → click voice → copy Voice ID. Choose a Latin American female voice.'
          />
        </ApiSection>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          {saveMsg && <span className="text-sm text-green-600">{saveMsg}</span>}
        </div>
      </form>
    </div>
  )
}
