'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import type { UserSummary } from '@/types'

interface UserFormModalProps {
  user?: UserSummary | null
  onClose: () => void
  onSaved: () => void
}

export function UserFormModal({ user, onClose, onSaved }: UserFormModalProps) {
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    password: '',
    level: 'BEGINNER',
    isAdmin: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  useEffect(() => {
    if (user) {
      setForm({ displayName: user.displayName, username: user.username, password: '', level: user.level, isAdmin: user.isAdmin })
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload: Record<string, unknown> = {
      displayName: form.displayName,
      level: form.level,
      isAdmin: form.isAdmin,
    }
    if (!isEdit) payload.username = form.username
    if (form.password) payload.password = form.password

    const url = isEdit ? `/api/admin/users/${user!.id}` : '/api/admin/users'
    const method = isEdit ? 'PATCH' : 'POST'

    if (!isEdit) payload.username = form.username

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      onSaved()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm m-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {isEdit ? `Edit ${user!.displayName}` : 'Add Family Member'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Display Name</label>
            <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {isEdit ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required={!isEdit} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Level</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.isAdmin} onChange={e => setForm(f => ({ ...f, isAdmin: e.target.checked }))}
              className="rounded border-slate-300" />
            Admin (can manage family members)
          </label>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
