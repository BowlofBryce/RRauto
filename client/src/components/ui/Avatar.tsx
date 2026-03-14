import { initials } from '@/lib/utils'

const colors = [
  '#0f62fe', '#198038', '#b28600', '#da1e28', '#0072c3',
  '#8a3ffc', '#007d79', '#ba4e00', '#6929c4', '#005d5d',
]

function hashCode(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

interface AvatarProps {
  name: string
  size?: number
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  const bg = colors[hashCode(name) % colors.length]
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 'var(--weight-medium)' as string,
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  )
}
