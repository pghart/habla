import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'green' | 'amber' | 'blue' | 'purple'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-slate-100 text-slate-700': variant === 'default',
          'bg-green-100 text-green-700': variant === 'green',
          'bg-amber-100 text-amber-700': variant === 'amber',
          'bg-blue-100 text-blue-700': variant === 'blue',
          'bg-purple-100 text-purple-700': variant === 'purple',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
