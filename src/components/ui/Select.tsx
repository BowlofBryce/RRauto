import { cn } from '../../lib/utils'
import type { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
      <select
        className={cn(
          'h-8 px-3 rounded-md text-sm text-text-primary bg-surface-3 border border-border',
          'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-100',
          className
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
