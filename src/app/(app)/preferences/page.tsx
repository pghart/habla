'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Spinner } from '@/components/ui/Spinner'

export default function PreferencesPage() {
  const { data: session } = useSession()
  const [level, setLevel] = useState('BEGINNER')
  const [teachingStyle, setTeachingStyle] = useState('CONVERSATION')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data.level) setLevel(data.level)
        if (data.teachingStyle) setTeachingStyle(data.teachingStyle)
        setLoaded(true)
      })
  }, [])

  async function save() {
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, teachingStyle }),
    })
    if (res.ok) {
      setSaved(true)
      // Refresh session so the change takes effect for the chat route immediately
      await signIn(undefined, { redirect: false })
    }
    setSaving(false)
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <Spinner className="w-8 h-8 text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">Preferences</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Personal settings for {session?.user?.name}. Changes take effect on the next message.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 dark:bg-slate-900 dark:border-slate-800">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Spanish Level</label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">How much Spanish vs English Sofía uses with you.</p>
          <select
            value={level}
            onChange={e => { setLevel(e.target.value); setSaved(false) }}
            className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="BEGINNER">Beginner — mostly English, some Spanish</option>
            <option value="INTERMEDIATE">Intermediate — mostly Spanish</option>
            <option value="ADVANCED">Advanced — all Spanish</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Teaching Style</label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">How Sofía structures the lesson.</p>
          <div className="space-y-2">
            {[
              { value: 'CONVERSATION', label: 'Conversation', desc: 'Natural chat. Light corrections, no drills.' },
              { value: 'DRILLS', label: 'Drills', desc: 'One grammar pattern per turn; she asks you for 2-3 sentences using it.' },
              { value: 'IMMERSION', label: 'Immersion', desc: 'Mostly Spanish regardless of level. Pushes you to swim.' },
            ].map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  teachingStyle === opt.value
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 dark:border-indigo-700'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="teachingStyle"
                  value={opt.value}
                  checked={teachingStyle === opt.value}
                  onChange={() => { setTeachingStyle(opt.value); setSaved(false) }}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{opt.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={save}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved — sign out and back in to refresh your session.</span>}
        </div>
      </div>
    </div>
  )
}
