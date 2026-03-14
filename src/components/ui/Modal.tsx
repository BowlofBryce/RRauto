import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md'
}

export function Modal({ open, onClose, title, children, size = 'sm' }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ type: 'spring', stiffness: 460, damping: 36, mass: 0.7 }}
            className={`relative z-10 card p-5 w-full ${size === 'md' ? 'max-w-lg' : 'max-w-md'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-1">{title}</h3>
              <button
                onClick={onClose}
                className="h-6 w-6 rounded-md flex items-center justify-center text-4 hover:text-2 hover:bg-subtle transition-colors"
              >
                <X size={13} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
