import type { ReactNode } from 'react'

type Variant = 'default' | 'blue' | 'green' | 'amber' | 'red' | 'rose' | 'gray'

const palette: Record<Variant, { bg: string; fg: string }> = {
  default: { bg: '#f3f3f3', fg: '#666' },
  blue: { bg: '#eff6ff', fg: '#1d4ed8' },
  green: { bg: '#f0fdf4', fg: '#15803d' },
  amber: { bg: '#fffbeb', fg: '#b45309' },
  red: { bg: '#fef2f2', fg: '#dc2626' },
  rose: { bg: '#fff1f2', fg: '#e11d48' },
  gray: { bg: '#f5f5f5', fg: '#737373' },
}

interface InlineBadgeProps {
  variant?: Variant
  children: ReactNode
  dot?: boolean
}

export function InlineBadge({ variant = 'default', children, dot }: InlineBadgeProps) {
  const p = palette[variant]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '1px 7px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 500,
      background: p.bg,
      color: p.fg,
      whiteSpace: 'nowrap',
      lineHeight: '18px',
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />}
      {children}
    </span>
  )
}

export function StatusDot({ color, label }: { color: string; label?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  )
}
