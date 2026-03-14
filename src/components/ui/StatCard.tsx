import { motion } from 'motion/react'
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

const accentStyles: Record<Accent, { bg: string; color: string }> = {
  blue:  { bg: 'var(--brand-bg)',  color: 'var(--brand)' },
  green: { bg: 'var(--green-bg)',  color: 'var(--green)' },
  amber: { bg: 'var(--amber-bg)',  color: 'var(--amber)' },
  red:   { bg: 'var(--red-bg)',    color: 'var(--red)' },
}

export function StatCard({ label, value, icon: Icon, trend, accent = 'blue', index = 0 }: Props) {
  const a = accentStyles[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, type: 'spring', stiffness: 300, damping: 26 }}
      whileHover={{ y: -1, transition: { duration: 0.12 } }}
      className="bg-raised rounded-xl p-4 cursor-default shadow-app-sm"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-semibold text-4 uppercase tracking-wider">{label}</span>
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: a.bg, color: a.color }}
        >
          <Icon size={13} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-1 tabular-nums">{value}</span>
        {trend && (
          <span
            className="text-xs font-medium mb-0.5"
            style={{ color: trend.value >= 0 ? 'var(--green)' : 'var(--red)' }}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
    </motion.div>
  )
}
