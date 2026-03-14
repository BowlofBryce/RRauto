import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  sub?: string
  color?: string
}

export function StatCard({ label, value, icon, sub, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: 8,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#888', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</span>
        {icon && <span style={{ color: color || '#aaa' }}>{icon}</span>}
      </div>
      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: '#111' }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: '#888' }}>{sub}</span>}
    </motion.div>
  )
}
