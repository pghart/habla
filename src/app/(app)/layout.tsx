import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar: hidden on mobile, visible md+ */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
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
