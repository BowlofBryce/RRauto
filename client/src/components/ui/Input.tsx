import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, CSSProperties } from 'react'

const baseStyle: CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-text)',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  transition: 'border-color var(--transition-fast)',
  height: 32,
}

export function Input(props: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, style, ...rest } = props
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' as string, color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
      )}
      <input
        {...rest}
        style={{ ...baseStyle, ...style }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; rest.onFocus?.(e) }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; rest.onBlur?.(e) }}
      />
    </label>
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, style, ...rest } = props
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' as string, color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
      )}
      <textarea
        {...rest}
        style={{ ...baseStyle, height: 'auto', minHeight: 72, resize: 'vertical', ...style }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
      />
    </label>
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  const { label, children, style, ...rest } = props
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' as string, color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
      )}
      <select
        {...rest}
        style={{ ...baseStyle, cursor: 'pointer', ...style }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
      >
        {children}
      </select>
    </label>
  )
}
