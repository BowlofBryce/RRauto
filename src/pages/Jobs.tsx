import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Calendar, Wrench } from 'lucide-react'
import { useBusiness } from '../context/BusinessContext'
import { getJobs, createJob, updateJob } from '../modules/jobs/jobs.service'
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
import type { JobWithContact } from '../modules/jobs/jobs.service'
import type { Contact } from '../types/crm.types'

type StatusKey = 'completed' | 'scheduled' | 'pending' | 'cancelled' | 'in_progress'
const statusCfg: Record<StatusKey, { variant: 'success' | 'warning' | 'neutral' | 'danger'; label: string }> = {
  completed: { variant: 'success', label: 'Completed' },
  scheduled: { variant: 'warning', label: 'Scheduled' },
  pending: { variant: 'neutral', label: 'Pending' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
  in_progress: { variant: 'warning', label: 'In Progress' },
}

const rowV = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, type: 'spring' as const, stiffness: 300, damping: 28 },
  }),
  exit: { opacity: 0, x: -8, transition: { duration: 0.14 } },
}

export function Jobs() {
  const { business } = useBusiness()
  const [jobs, setJobs] = useState<JobWithContact[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ contact_id: '', service_type: '', scheduled_date: '', price: '', notes: '' })

  const load = async () => {
    if (!business) return
    setLoading(true)
    const [j, c] = await Promise.all([getJobs(business.id), getContacts(business.id)])
    setJobs(j)
    setContacts(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [business])

  const handleCreate = async () => {
    if (!business || !form.contact_id || !form.service_type) return
    setSaving(true)
    await createJob({
      business_id: business.id,
      contact_id: form.contact_id,
      service_type: form.service_type,
      scheduled_date: form.scheduled_date || null,
      price: parseFloat(form.price) || 0,
      notes: form.notes || null,
    })
    setSaving(false)
    setAddOpen(false)
    setForm({ contact_id: '', service_type: '', scheduled_date: '', price: '', notes: '' })
    load()
  }

  const handleStatus = async (id: string, status: string) => {
    setJobs((p) => p.map((j) => j.id === id ? { ...j, status } : j))
    await updateJob(id, { status })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Jobs"
        description={`${jobs.length} total`}
        actions={
          <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> New Job
          </Button>
        }
      />

      <div className="bg-raised border border-app rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : jobs.length === 0 ? (
          <EmptyState icon={Wrench} title="No jobs yet" description="Schedule your first job" action={{ label: 'New Job', onClick: () => setAddOpen(true) }} />
        ) : (
          <>
            <div className="grid grid-cols-[40px_1fr_130px_80px_140px] gap-4 px-5 py-2.5 border-b border-app">
              <div />
              <div className="text-[10px] font-semibold text-4 uppercase tracking-wider">Contact</div>
              <div className="text-[10px] font-semibold text-4 uppercase tracking-wider">Date</div>
              <div className="text-[10px] font-semibold text-4 uppercase tracking-wider text-right">Price</div>
              <div className="text-[10px] font-semibold text-4 uppercase tracking-wider">Status</div>
            </div>
            <motion.ul layout className="divide-y divide-app">
              <AnimatePresence initial={false}>
                {jobs.map((job, i) => {
                  const cfg = statusCfg[job.status as StatusKey] ?? { variant: 'neutral' as const, label: job.status }
                  return (
                    <motion.li
                      key={job.id}
                      custom={i}
                      variants={rowV}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="grid grid-cols-[40px_1fr_130px_80px_140px] gap-4 items-center px-5 py-3.5 row-hover transition-colors"
                    >
                      <Avatar name={job.contacts.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-1 truncate">{job.contacts.name}</p>
                        <p className="text-xs text-3 truncate flex items-center gap-1 mt-0.5">
                          <Wrench size={10} />{job.service_type}
                        </p>
                      </div>
                      <div>
                        {job.scheduled_date ? (
                          <span className="flex items-center gap-1 text-xs text-2">
                            <Calendar size={10} />{formatDate(job.scheduled_date)}
                          </span>
                        ) : (
                          <span className="text-xs text-4">Unscheduled</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-1 tabular-nums">{formatCurrency(job.price)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        <select
                          value={job.status}
                          onChange={(e) => handleStatus(job.id, e.target.value)}
                          className="text-xs bg-transparent border-0 focus:outline-none text-4 cursor-pointer"
                        >
                          {Object.entries(statusCfg).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </motion.ul>
          </>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Job">
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-2">Contact *</label>
            <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              className="input-base h-8 px-3 rounded-lg text-[13px] focus:outline-none">
              <option value="">Select contact...</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Service Type *" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} placeholder="e.g. Lawn Mowing" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Scheduled Date" type="datetime-local" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
            <Input label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>Create Job</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
