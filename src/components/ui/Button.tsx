import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'xs' | 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({ children, variant = 'secondary', size = 'md', loading, className, disabled, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none cursor-pointer focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none gap-1.5'

  const variants: Record<Variant, string> = {
    primary:   'text-white shadow-app-xs hover:opacity-90 active:scale-[0.98]',
    secondary: 'bg-raised border border-app text-1 hover:bg-subtle shadow-app-xs active:scale-[0.98]',
    ghost:     'text-3 hover:text-2 hover:bg-subtle active:scale-[0.98]',
    danger:    'bg-red-subtle text-red-muted hover:opacity-90 active:scale-[0.98]',
  }

  const sizes: Record<Size, string> = {
    xs: 'h-6 px-2 text-[11px]',
    sm: 'h-7 px-2.5 text-xs',
    md: 'h-8 px-3.5 text-[13px]',
  }

  const primaryStyle = variant === 'primary' ? { backgroundColor: 'var(--brand)' } : {}

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={primaryStyle}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
