import { motion } from 'motion/react'
import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

type Accent = 'blue' | 'green' | 'amber' | 'red'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  accent?: Accent
  index?: number
}

const accents: Record<Accent, string> = {
  blue: 'text-blue-400 bg-blue-950 border-blue-900',
  green: 'text-emerald-400 bg-emerald-950 border-emerald-900',
  amber: 'text-amber-400 bg-amber-950 border-amber-900',
  red: 'text-red-400 bg-red-950 border-red-900',
}

export function StatCard({ label, value, icon: Icon, trend, accent = 'blue', index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, type: 'spring', stiffness: 300, damping: 26 }}
      whileHover={{ y: -1, transition: { duration: 0.12 } }}
      className="bg-surface-2 border border-border rounded-xl p-4 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-semibold text-text-disabled uppercase tracking-wider">{label}</span>
        <div className={cn('h-7 w-7 rounded-lg border flex items-center justify-center', accents[accent])}>
          <Icon size={13} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-text-primary tabular-nums">{value}</span>
        {trend && (
          <span className={cn('text-xs font-medium mb-0.5', trend.value >= 0 ? 'text-success' : 'text-danger')}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
    </motion.div>
  )
}
