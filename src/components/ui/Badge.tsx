import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'muted'

interface Props {
  children: ReactNode
  variant?: Variant
  className?: string
}

const styles: Record<Variant, string> = {
  default: 'bg-accent-subtle text-accent border border-accent-muted',
  success: 'bg-success-subtle text-success border border-success-muted',
  warning: 'bg-warning-subtle text-warning border border-warning-muted',
  danger: 'bg-danger-subtle text-danger border border-danger-muted',
  muted: 'bg-surface-3 text-text-tertiary border border-border',
}

export function Badge({ children, variant = 'default', className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded uppercase tracking-wide',
      styles[variant], className
    )}>
      {children}
    </span>
  )
}
