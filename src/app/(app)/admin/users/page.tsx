'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UserTable } from '@/components/admin/UserTable'
import { UserFormModal } from '@/components/admin/UserFormModal'
import { Button } from '@/components/ui/Button'
import type { UserSummary } from '@/types'

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<UserSummary | null | undefined>(undefined)

  useEffect(() => {
    if (session && !session.user.isAdmin) router.replace('/dashboard')
  }, [session, router])

  const loadUsers = () => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
  }

  useEffect(() => { loadUsers() }, [])

  const handleDelete = async (user: UserSummary) => {
    if (!confirm(`Remove ${user.displayName}? This will delete all their data.`)) return
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    loadUsers()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Family Members</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage who can access Habla.</p>
        </div>
        <Button onClick={() => setEditingUser(null)}>+ Add Member</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
      ) : (
        <UserTable
          users={users}
          currentUserId={session?.user?.id ?? ''}
          onEdit={setEditingUser}
          onDelete={handleDelete}
        />
      )}

      {editingUser !== undefined && (
        <UserFormModal
          user={editingUser}
          onClose={() => setEditingUser(undefined)}
          onSaved={() => { setEditingUser(undefined); loadUsers() }}
        />
      )}
    </div>
  )
}
