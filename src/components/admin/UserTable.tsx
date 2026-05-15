'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { UserSummary } from '@/types'

interface UserTableProps {
  users: UserSummary[]
  currentUserId: string
  onEdit: (user: UserSummary) => void
  onDelete: (user: UserSummary) => void
}

const levelVariant = {
  BEGINNER: 'blue' as const,
  INTERMEDIATE: 'amber' as const,
  ADVANCED: 'green' as const,
}

export function UserTable({ users, currentUserId, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left">
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Username</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Level</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Role</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map(user => (
            <tr key={user.id} className={user.id === currentUserId ? 'bg-indigo-50/50' : ''}>
              <td className="px-4 py-3 font-medium text-slate-800">
                {user.displayName}
                {user.id === currentUserId && <span className="text-xs text-slate-400 ml-2">(you)</span>}
              </td>
              <td className="px-4 py-3 text-slate-500">{user.username}</td>
              <td className="px-4 py-3">
                <Badge variant={levelVariant[user.level]}>
                  {user.level.charAt(0) + user.level.slice(1).toLowerCase()}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {user.isAdmin && <Badge variant="purple">Admin</Badge>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                  <Button size="sm" variant="secondary" onClick={() => onEdit(user)}>Edit</Button>
                  {user.id !== currentUserId && (
                    <Button size="sm" variant="danger" onClick={() => onDelete(user)}>Remove</Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
