import type { CSSProperties, ReactNode } from 'react'

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

const styles: Record<Variant, CSSProperties> = {
  default: { background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' },
  primary: { background: 'var(--color-primary-subtle)', color: 'var(--color-primary-text)' },
  success: { background: 'var(--color-success-subtle)', color: 'var(--color-success-text)' },
  warning: { background: 'var(--color-warning-subtle)', color: 'var(--color-warning-text)' },
  error: { background: 'var(--color-error-subtle)', color: 'var(--color-error-text)' },
  info: { background: 'var(--color-info-subtle)', color: 'var(--color-info)' },
}

interface BadgeProps {
  variant?: Variant
  children: ReactNode
  dot?: boolean
}

export function Badge({ variant = 'default', children, dot }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)' as string,
        letterSpacing: '0.02em',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        lineHeight: '18px',
        ...styles[variant],
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'currentColor',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}

const statusVariantMap: Record<string, Variant> = {
  new: 'primary',
  contacted: 'info',
  quoted: 'warning',
  won: 'success',
  lost: 'error',
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  scheduled: 'primary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
  open: 'primary',
  closed: 'default',
  active: 'success',
  inactive: 'default',
  pending: 'warning',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariantMap[status] ?? 'default'} dot>
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}
