import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'neutral'

interface Props {
  children: ReactNode
  variant?: Variant
  className?: string
}

const styles: Record<Variant, string> = {
  default:  'bg-brand-subtle text-brand-muted',
  success:  'bg-green-subtle text-green-muted',
  warning:  'bg-amber-subtle text-amber-muted',
  danger:   'bg-red-subtle text-red-muted',
  neutral:  'bg-subtle text-3',
}

export function Badge({ children, variant = 'neutral', className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-md',
      styles[variant], className
    )}>
      {children}
    </span>
  )
}
