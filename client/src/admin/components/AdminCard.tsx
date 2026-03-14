import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AdminCardProps {
  children: ReactNode
  padding?: string
  style?: React.CSSProperties
  onClick?: () => void
  hoverable?: boolean
}

export function AdminCard({ children, padding = '16px', style, onClick, hoverable }: AdminCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: 8,
        padding,
        cursor: onClick || hoverable ? 'pointer' : 'default',
        transition: 'border-color 100ms ease, box-shadow 100ms ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick || hoverable) {
          e.currentTarget.style.borderColor = '#ccc'
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e5e5'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </motion.div>
  )
}

export function AdminSection({ title, description, children, actions }: {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{title}</div>
          {description && <div style={{ fontSize: 11.5, color: '#888', marginTop: 1 }}>{description}</div>}
        </div>
        {actions}
      </div>
      <div>{children}</div>
    </div>
  )
}
