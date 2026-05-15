'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/conversation', label: 'Conversations', icon: '💬' },
  { href: '/preferences', label: 'Preferences', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const linkClasses = (active: boolean) =>
    cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
      active
        ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950 dark:text-indigo-300'
        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
    )

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-full dark:bg-slate-900 dark:border-slate-800">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Habla</h1>
          <p className="text-xs text-slate-400 mt-0.5 dark:text-slate-500">Spanish tutor</p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClasses(pathname === item.href || pathname.startsWith(item.href + '/'))}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {session?.user?.isAdmin && (
          <>
            <Link href="/admin/users" className={linkClasses(pathname === '/admin/users')}>
              <span>👨‍👩‍👧</span>
              Family
            </Link>
            <Link href="/admin/settings" className={linkClasses(pathname === '/admin/settings')}>
              <span>🔑</span>
              API Settings
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="text-sm text-slate-700 font-medium truncate dark:text-slate-200">{session?.user?.name}</div>
        <div className="text-xs text-slate-400 capitalize mt-0.5 dark:text-slate-500">{session?.user?.level?.toLowerCase()}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
