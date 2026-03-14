interface FilterChipsProps {
  options: { label: string; value: string }[]
  active: string
  onChange: (value: string) => void
}

export function FilterChips({ options, active, onChange }: FilterChipsProps) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const isActive = opt.value === active
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '4px 12px',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)' as string,
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
              background: isActive ? 'var(--color-primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              lineHeight: '20px',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
