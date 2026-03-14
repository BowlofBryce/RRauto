import { motion } from 'framer-motion'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function ToggleSwitch({ checked, onChange, disabled, size = 'md' }: ToggleSwitchProps) {
  const w = size === 'sm' ? 28 : 34
  const h = size === 'sm' ? 16 : 20
  const dot = size === 'sm' ? 12 : 16

  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(!checked) }}
      style={{
        width: w,
        height: h,
        borderRadius: h,
        border: 'none',
        padding: 2,
        background: checked ? '#0f62fe' : '#ddd',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        transition: 'background 150ms ease',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? w - dot - 4 : 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{
          width: dot,
          height: dot,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  )
}
