import { cn } from '../../lib/utils'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[12px] font-medium text-3">{label}</label>}
      <input
        className={cn(
          'input-base h-8 px-3 rounded-lg text-[13px] w-full',
          error && 'border-red',
          className
        )}
        {...rest}
      />
      {error && <p className="text-[11px] text-red-muted">{error}</p>}
    </div>
  )
}
