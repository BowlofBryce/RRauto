import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: string
  trendUp?: boolean
}

export function MetricCard({ label, value, icon, trend, trendUp }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--weight-medium)' as string }}>
          {label}
        </span>
        {icon && <span style={{ color: 'var(--color-text-tertiary)' }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)' as string, letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {trend && (
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-medium)' as string,
            color: trendUp ? 'var(--color-success-text)' : 'var(--color-text-tertiary)',
          }}>
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  )
}
