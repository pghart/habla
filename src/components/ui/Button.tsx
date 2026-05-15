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
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-indigo-600 hover:bg-indigo-700 text-white': variant === 'primary',
          'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700': variant === 'secondary',
          'hover:bg-slate-100 text-slate-700': variant === 'ghost',
          'bg-red-600 hover:bg-red-700 text-white': variant === 'danger',
        },
        {
          'text-xs px-2.5 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-5 py-2.5': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
