import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        gap: 12,
      }}
    >
      <div style={{ color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{icon}</div>
      <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text)' }}>{title}</h3>
      <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-tertiary)', maxWidth: 320 }}>{description}</p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </motion.div>
  )
}
