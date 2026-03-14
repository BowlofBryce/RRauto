import { cn } from '../../lib/utils'
import { initials } from '../../lib/utils'

const palette = [
  'bg-blue-900 text-blue-200',
  'bg-emerald-900 text-emerald-200',
  'bg-amber-900 text-amber-200',
  'bg-rose-900 text-rose-200',
  'bg-teal-900 text-teal-200',
  'bg-orange-900 text-orange-200',
]

function colorFor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return palette[Math.abs(h) % palette.length]
}

type Size = 'sm' | 'md' | 'lg'
const sizes: Record<Size, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

export function Avatar({ name, size = 'md', className }: { name: string; size?: Size; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0',
      sizes[size], colorFor(name), className
    )}>
      {initials(name)}
    </span>
  )
}
