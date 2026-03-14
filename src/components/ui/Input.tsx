import { cn } from '../../lib/utils'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
      <input
        className={cn(
          'h-8 px-3 rounded-md text-sm text-text-primary bg-surface-3 border border-border',
          'placeholder:text-text-disabled',
          'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-100',
          error && 'border-danger focus:ring-danger',
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
