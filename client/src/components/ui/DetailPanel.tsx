import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface DetailPanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
}

export function DetailPanel({ open, onClose, title, subtitle, children, actions }: DetailPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.15)',
              zIndex: 900,
            }}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: 420,
              maxWidth: '100vw',
              background: 'var(--color-bg-elevated)',
              borderLeft: '1px solid var(--color-border)',
              zIndex: 901,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', lineHeight: 'var(--leading-tight)' }}>{title}</h3>
                {subtitle && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-tertiary)',
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {children}
            </div>
            {actions && (
              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'flex-end',
                }}
              >
                {actions}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{children}</span>
    </div>
  )
}
