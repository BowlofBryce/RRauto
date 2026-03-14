import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, FileText, Send, CheckCircle } from 'lucide-react'
import { useBusiness } from '../context/BusinessContext'
import { getQuotes, createQuote, updateQuote } from '../modules/quotes/quotes.service'
import { getContacts } from '../modules/contacts/contacts.service'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../lib/utils'
import type { QuoteWithContact } from '../modules/quotes/quotes.service'
import type { Contact } from '../types/crm.types'

type StatusKey = 'draft' | 'sent' | 'accepted' | 'declined'
const statusCfg: Record<StatusKey, { variant: 'success' | 'warning' | 'muted' | 'danger'; label: string }> = {
  draft: { variant: 'muted', label: 'Draft' },
  sent: { variant: 'warning', label: 'Sent' },
  accepted: { variant: 'success', label: 'Accepted' },
  declined: { variant: 'danger', label: 'Declined' },
}

const rowV = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, type: 'spring' as const, stiffness: 300, damping: 28 },
  }),
  exit: { opacity: 0, x: -8, transition: { duration: 0.14 } },
}

export function Quotes() {
  const { business } = useBusiness()
  const [quotes, setQuotes] = useState<QuoteWithContact[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ contact_id: '', amount: '', notes: '' })

  const load = async () => {
    if (!business) return
    setLoading(true)
    const [q, c] = await Promise.all([getQuotes(business.id), getContacts(business.id)])
    setQuotes(q)
    setContacts(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [business])

  const handleCreate = async () => {
    if (!business || !form.contact_id || !form.amount) return
    setSaving(true)
    await createQuote({ business_id: business.id, contact_id: form.contact_id, amount: parseFloat(form.amount), notes: form.notes || null })
    setSaving(false)
    setAddOpen(false)
    setForm({ contact_id: '', amount: '', notes: '' })
    load()
  }

  const handleSend = async (id: string) => {
    setQuotes((p) => p.map((q) => q.id === id ? { ...q, status: 'sent', sent_date: new Date().toISOString() } : q))
    await updateQuote(id, { status: 'sent', sent_date: new Date().toISOString() })
  }

  const handleAccept = async (id: string) => {
    setQuotes((p) => p.map((q) => q.id === id ? { ...q, status: 'accepted', accepted_date: new Date().toISOString() } : q))
    await updateQuote(id, { status: 'accepted', accepted_date: new Date().toISOString() })
  }

  const totalAccepted = quotes.filter((q) => q.status === 'accepted').reduce((s, q) => s + q.amount, 0)

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Quotes"
        description={`${formatCurrency(totalAccepted)} accepted`}
        actions={
          <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> New Quote
          </Button>
        }
      />

      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : quotes.length === 0 ? (
          <EmptyState icon={FileText} title="No quotes yet" description="Create your first quote" action={{ label: 'New Quote', onClick: () => setAddOpen(true) }} />
        ) : (
          <>
            <div className="grid grid-cols-[40px_1fr_100px_120px_80px_80px] gap-4 px-5 py-2.5 border-b border-border">
              <div />
              <div className="text-[10px] font-semibold text-text-disabled uppercase tracking-wider">Contact</div>
              <div className="text-[10px] font-semibold text-text-disabled uppercase tracking-wider text-right">Amount</div>
              <div className="text-[10px] font-semibold text-text-disabled uppercase tracking-wider">Sent</div>
              <div className="text-[10px] font-semibold text-text-disabled uppercase tracking-wider">Status</div>
              <div />
            </div>
            <motion.ul layout className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {quotes.map((q, i) => {
                  const cfg = statusCfg[q.status as StatusKey] ?? { variant: 'muted' as const, label: q.status }
                  return (
                    <motion.li
                      key={q.id}
                      custom={i}
                      variants={rowV}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="grid grid-cols-[40px_1fr_100px_120px_80px_80px] gap-4 items-center px-5 py-3.5 hover:bg-surface-3 transition-colors"
                    >
                      <Avatar name={q.contacts.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{q.contacts.name}</p>
                        {q.notes && <p className="text-xs text-text-tertiary truncate mt-0.5">{q.notes}</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-text-primary tabular-nums">{formatCurrency(q.amount)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-text-tertiary">{q.sent_date ? formatDate(q.sent_date) : '—'}</span>
                      </div>
                      <div>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      <div className="flex justify-end">
                        {q.status === 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => handleSend(q.id)}>
                            <Send size={11} />Send
                          </Button>
                        )}
                        {q.status === 'sent' && (
                          <Button variant="ghost" size="sm" onClick={() => handleAccept(q.id)}>
                            <CheckCircle size={11} />Accept
                          </Button>
                        )}
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </motion.ul>
          </>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Quote">
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Contact *</label>
            <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              className="h-8 px-3 rounded-md text-sm text-text-primary bg-surface-3 border border-border focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors">
              <option value="">Select contact...</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Amount *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="px-3 py-2 rounded-md text-sm text-text-primary bg-surface-3 border border-border placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>Create Quote</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
