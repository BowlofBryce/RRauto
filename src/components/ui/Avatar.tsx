import { cn } from '../../lib/utils'
import { initials } from '../../lib/utils'

const palette: [string, string][] = [
  ['#1e3a8a', '#93c5fd'],
  ['#064e3b', '#6ee7b7'],
  ['#78350f', '#fcd34d'],
  ['#881337', '#fda4af'],
  ['#134e4a', '#5eead4'],
  ['#3b0764', '#c4b5fd'],
  ['#1c1917', '#a8a29e'],
]

function colorFor(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return palette[Math.abs(h) % palette.length]
}

type Size = 'xs' | 'sm' | 'md' | 'lg'
const sizes: Record<Size, string> = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

export function Avatar({ name, size = 'md', className }: { name: string; size?: Size; className?: string }) {
  const [bg, fg] = colorFor(name)
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0 select-none', sizes[size], className)}
      style={{ backgroundColor: bg, color: fg }}
    >
      {initials(name)}
    </span>
  )
}
