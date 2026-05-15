import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        {
          'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm': variant === 'primary',
          'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm': variant === 'secondary',
          'hover:bg-slate-100 text-slate-700': variant === 'ghost',
          'bg-red-500 hover:bg-red-600 text-white shadow-sm': variant === 'danger',
        },
        {
          'text-xs px-3 py-2 min-h-[36px]': size === 'sm',
          'text-sm px-4 py-2.5 min-h-[44px]': size === 'md',
          'text-base px-5 py-3 min-h-[48px]': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
