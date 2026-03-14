import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  badge?: ReactNode
}

export function AdminPageHeader({ title, description, actions, badge }: AdminPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingBottom: 20,
        gap: 16,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: '#111' }}>{title}</h1>
          {badge}
        </div>
        {description && (
          <p style={{ fontSize: 12.5, color: '#777', marginTop: 3, lineHeight: 1.4 }}>{description}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>{actions}</div>}
    </motion.div>
  )
}
