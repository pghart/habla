import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar: hidden on mobile, visible md+ */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile-only floating theme toggle */}
      <div className="md:hidden fixed top-3 right-3 z-40">
        <ThemeToggle />
      </div>

      {/* Main content: add bottom padding on mobile to clear the bottom nav */}
      <main className="flex-1 overflow-auto min-w-0 pb-14 md:pb-0">
        {children}
      </main>

      {/* Bottom nav: only visible on mobile */}
      <BottomNav />
    </div>
  )
}
