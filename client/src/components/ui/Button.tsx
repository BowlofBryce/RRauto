import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    background: 'var(--color-primary)',
    color: '#fff',
    border: '1px solid var(--color-primary)',
  },
  secondary: {
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--color-error)',
    color: '#fff',
    border: '1px solid var(--color-error)',
  },
}

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { padding: '4px 10px', fontSize: 'var(--text-sm)', height: 28 },
  md: { padding: '6px 14px', fontSize: 'var(--text-base)', height: 32 },
  lg: { padding: '8px 18px', fontSize: 'var(--text-md)', height: 36 },
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  icon?: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', children, icon, style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'var(--weight-medium)' as string,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = props.disabled ? '0.5' : '1'
      }}
    >
      {icon}
      {children}
    </button>
  )
}
