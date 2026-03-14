import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--subtle)', border: '1px solid var(--border)' }}
      >
        <Icon size={20} className="text-4" />
      </div>
      <h3 className="text-[13px] font-semibold text-1 mb-1">{title}</h3>
      <p className="text-[13px] text-3 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <div className="mt-5">
          <Button variant="primary" size="md" onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </motion.div>
  )
}
