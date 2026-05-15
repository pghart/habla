'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/conversation', label: 'Conversations', icon: '💬' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-5 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-indigo-700">Habla</h1>
        <p className="text-xs text-slate-400 mt-0.5">Spanish tutor</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {session?.user?.isAdmin && (
          <>
            <Link
              href="/admin/users"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === '/admin/users'
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <span>👨‍👩‍👧</span>
              Family
            </Link>
            <Link
              href="/admin/settings"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === '/admin/settings'
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <span>🔑</span>
              API Settings
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="text-sm text-slate-700 font-medium truncate">{session?.user?.name}</div>
        <div className="text-xs text-slate-400 capitalize mt-0.5">{session?.user?.level?.toLowerCase()}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
