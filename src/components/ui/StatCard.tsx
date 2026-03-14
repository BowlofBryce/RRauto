import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

type Accent = 'blue' | 'green' | 'amber' | 'red'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  sub?: string
  accent?: Accent
  index?: number
}

const accentMap: Record<Accent, { bg: string; color: string }> = {
  blue:  { bg: 'var(--brand-bg)',  color: 'var(--brand)' },
  green: { bg: 'var(--green-bg)',  color: 'var(--green)' },
  amber: { bg: 'var(--amber-bg)',  color: 'var(--amber)' },
  red:   { bg: 'var(--red-bg)',    color: 'var(--red)' },
}

export function StatCard({ label, value, icon: Icon, sub, accent = 'blue', index = 0 }: Props) {
  const a = accentMap[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
      className="card p-5 cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold text-4 uppercase tracking-widest">{label}</p>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: a.bg }}>
          <Icon size={15} style={{ color: a.color }} />
        </div>
      </div>
      <p className="text-[26px] font-semibold text-1 tracking-tight leading-none tabular-nums">{value}</p>
      {sub && <p className="text-[12px] text-3 mt-1.5">{sub}</p>}
    </motion.div>
  )
}
