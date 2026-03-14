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
      <div className="h-12 w-12 rounded-xl bg-surface-3 border border-border flex items-center justify-center mb-4">
        <Icon size={20} className="text-text-disabled" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-tertiary max-w-xs">{description}</p>
      {action && (
        <div className="mt-5">
          <Button variant="primary" size="md" onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </motion.div>
  )
}
