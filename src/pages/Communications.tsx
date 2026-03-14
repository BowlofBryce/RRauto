import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageSquare, Mail, ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react'
import { useBusiness } from '../context/BusinessContext'
import { getCommunications } from '../modules/communications/communications.service'
import { PageHeader } from '../components/layout/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatRelative } from '../lib/utils'
import type { CommunicationWithContact } from '../modules/communications/communications.service'

type Filter = 'all' | 'sms' | 'email'

const rowV = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.025, type: 'spring' as const, stiffness: 300, damping: 28 },
  }),
}

export function Communications() {
  const { business } = useBusiness()
  const [comms, setComms] = useState<CommunicationWithContact[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (!business) return
    getCommunications(business.id).then((data) => {
      setComms(data)
      setLoading(false)
    })
  }, [business])

  const filtered = filter === 'all' ? comms : comms.filter((c) => c.type === filter)

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Inbox"
        description={`${comms.length} messages`}
        actions={
          <div className="flex items-center gap-0.5 bg-subtle rounded-lg p-0.5">
            {(['all', 'sms', 'email'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  filter === f ? 'bg-raised text-1 shadow-app-sm' : 'text-3 hover:text-2'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <div className="bg-raised border border-app rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No messages" description="Communications will appear here once sent or received" />
        ) : (
          <motion.ul layout className="divide-y divide-app">
            <AnimatePresence initial={false}>
              {filtered.map((c, i) => (
                <motion.li
                  key={c.id}
                  custom={i}
                  variants={rowV}
                  initial="hidden"
                  animate="visible"
                  layout
                  className="flex items-start gap-4 px-5 py-4 row-hover transition-colors"
                >
                  <Avatar name={c.contacts.name} size="sm" className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-1">{c.contacts.name}</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-4">
                        {c.direction === 'sent'
                          ? <ArrowUpRight size={9} className="text-green" />
                          : <ArrowDownLeft size={9} className="text-brand" />
                        }
                        {c.direction}
                      </span>
                      {c.automation_id && (
                        <span className="flex items-center gap-0.5 text-[10px] text-4">
                          <Zap size={9} />auto
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-2 leading-relaxed line-clamp-2">{c.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge variant={c.type === 'sms' ? 'success' : 'default'}>
                      {c.type === 'sms' ? <><MessageSquare size={8} />SMS</> : <><Mail size={8} />Email</>}
                    </Badge>
                    <span className="text-[11px] text-4">{formatRelative(c.sent_at)}</span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  )
}
