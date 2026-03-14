import { useEffect, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { Plus, Zap, Play, Pause, Trash2, ArrowRight, Clock } from 'lucide-react'
import { useBusiness } from '../context/BusinessContext'
import {
  getAutomations,
  createAutomation,
  deleteAutomation,
  toggleAutomation,
} from '../modules/automations/automations.service'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import type { Automation } from '../types/crm.types'

const triggerLabels: Record<string, string> = {
  lead_created: 'Lead Created',
  quote_sent: 'Quote Sent',
  job_scheduled: 'Job Scheduled',
  job_completed: 'Job Completed',
  customer_inactive: 'Customer Inactive',
  missed_call: 'Missed Call',
}

const actionLabels: Record<string, string> = {
  send_sms: 'Send SMS',
  send_email: 'Send Email',
  create_task: 'Create Task',
  update_pipeline_stage: 'Update Pipeline',
}

const triggerColors: Record<string, string> = {
  lead_created: 'text-blue-400 bg-blue-950 border-blue-900',
  quote_sent: 'text-amber-400 bg-amber-950 border-amber-900',
  job_scheduled: 'text-emerald-400 bg-emerald-950 border-emerald-900',
  job_completed: 'text-teal-400 bg-teal-950 border-teal-900',
  customer_inactive: 'text-orange-400 bg-orange-950 border-orange-900',
  missed_call: 'text-red-400 bg-red-950 border-red-900',
}

const cardV = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.05, type: 'spring' as const, stiffness: 300, damping: 26 },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

const DEFAULT_FORM = {
  name: '',
  trigger: 'lead_created',
  action: 'send_sms',
  delay_minutes: '0',
  message: '',
}

export function Automations() {
  const { business } = useBusiness()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)

  const load = async () => {
    if (!business) return
    setLoading(true)
    const data = await getAutomations(business.id)
    setAutomations(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [business])

  const handleCreate = async () => {
    if (!business || !form.name.trim() || !form.message.trim()) return
    setSaving(true)
    await createAutomation({
      business_id: business.id,
      name: form.name,
      trigger: form.trigger,
      action: form.action,
      delay_minutes: parseInt(form.delay_minutes) || 0,
      action_config: { message: form.message },
      is_active: true,
    })
    setSaving(false)
    setAddOpen(false)
    setForm(DEFAULT_FORM)
    load()
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    setAutomations((p) => p.map((a) => a.id === id ? { ...a, is_active: !isActive } : a))
    await toggleAutomation(id, !isActive)
  }

  const handleDelete = async (id: string) => {
    setAutomations((p) => p.filter((a) => a.id !== id))
    await deleteAutomation(id)
  }

  const active = automations.filter((a) => a.is_active)
  const inactive = automations.filter((a) => !a.is_active)

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Automations"
        description={`${active.length} active`}
        actions={
          <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> New Automation
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : automations.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No automations yet"
          description="Automate SMS, emails, and follow-ups to save time and win more jobs"
          action={{ label: 'Create Automation', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <LayoutGroup>
          {active.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-semibold text-text-disabled uppercase tracking-widest mb-3 px-1">
                Active — {active.length}
              </p>
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence>
                  {active.map((a, i) => (
                    <AutoCard key={a.id} automation={a} index={i} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {inactive.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-disabled uppercase tracking-widest mb-3 px-1">
                Paused — {inactive.length}
              </p>
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
                <AnimatePresence>
                  {inactive.map((a, i) => (
                    <AutoCard key={a.id} automation={a} index={i} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </LayoutGroup>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Automation" size="md">
        <div className="space-y-3">
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Lead Response"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Trigger</label>
              <select
                value={form.trigger}
                onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                className="h-8 px-3 rounded-md text-sm text-text-primary bg-surface-3 border border-border focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
              >
                {Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Action</label>
              <select
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
                className="h-8 px-3 rounded-md text-sm text-text-primary bg-surface-3 border border-border focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
              >
                {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <Input
            label="Delay (minutes after trigger)"
            type="number"
            value={form.delay_minutes}
            onChange={(e) => setForm({ ...form, delay_minutes: e.target.value })}
            placeholder="0 = immediate"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              placeholder={'Use {{contact.name}}, {{business.name}}, etc.'}
              className="px-3 py-2 rounded-md text-sm text-text-primary bg-surface-3 border border-border placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors resize-none font-mono text-xs"
            />
            <p className="text-[10px] text-text-disabled">
              {'Variables: {{contact.name}} {{business.name}} {{job.service_type}}'}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

interface CardProps {
  automation: Automation
  index: number
  onToggle: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
}

function AutoCard({ automation, index, onToggle, onDelete }: CardProps) {
  const accent = triggerColors[automation.trigger] ?? 'text-text-tertiary bg-surface-3 border-border'
  const cfg = automation.action_config as Record<string, string>

  return (
    <motion.div
      layout
      custom={index}
      variants={cardV}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-surface-2 border border-border rounded-xl p-4 group hover:border-border-strong transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`h-7 w-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${accent}`}>
            <Zap size={12} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary leading-tight">{automation.name}</p>
            <p className="text-[11px] text-text-disabled capitalize mt-0.5">
              {automation.trigger.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(automation.id, automation.is_active)}
            className="p-1.5 rounded text-text-disabled hover:text-text-secondary hover:bg-surface-3 transition-colors"
          >
            {automation.is_active ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={() => onDelete(automation.id)}
            className="p-1.5 rounded text-text-disabled hover:text-danger hover:bg-danger-subtle transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <Badge variant="muted">{triggerLabels[automation.trigger] ?? automation.trigger}</Badge>
        <ArrowRight size={10} className="text-text-disabled flex-shrink-0" />
        {automation.delay_minutes > 0 && (
          <>
            <span className="flex items-center gap-1 text-[10px] text-text-disabled">
              <Clock size={9} />
              {automation.delay_minutes >= 60 ? `${automation.delay_minutes / 60}h` : `${automation.delay_minutes}m`} delay
            </span>
            <ArrowRight size={10} className="text-text-disabled flex-shrink-0" />
          </>
        )}
        <Badge variant={automation.is_active ? 'success' : 'muted'}>
          {actionLabels[automation.action] ?? automation.action}
        </Badge>
      </div>

      {cfg.message && (
        <p className="text-[11px] text-text-tertiary bg-surface-3 rounded px-3 py-2 line-clamp-2 font-mono leading-relaxed">
          {cfg.message}
        </p>
      )}
    </motion.div>
  )
}
