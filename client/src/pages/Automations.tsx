import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Zap, Download, Plus, Power, PowerOff, Clock, ArrowRight, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useData } from '@/hooks/useData'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { DetailPanel, DetailRow } from '@/components/ui/DetailPanel'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Automation } from '@/lib/types'

const triggerLabels: Record<string, string> = {
  lead_created: 'When a new lead comes in',
  quote_sent: 'When a quote is sent',
  job_scheduled: 'When a job is scheduled',
  job_completed: 'When a job is completed',
  customer_inactive: 'When a customer goes inactive',
  missed_call: 'When a call is missed',
}

const actionLabels: Record<string, string> = {
  send_sms: 'Send SMS',
  send_email: 'Send Email',
  create_task: 'Create Task',
  update_pipeline_stage: 'Move Pipeline Stage',
}

export function AutomationsPage() {
  const { data: automations, loading, refresh } = useData<Automation>('/automations')
  const { toast } = useToast()
  const [selected, setSelected] = useState<Automation | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const toggleActive = async (automation: Automation) => {
    await api.patch(`/automations/${automation.id}`, { is_active: !automation.is_active })
    toast(automation.is_active ? 'Automation paused' : 'Automation activated')
    refresh()
  }

  const installDefaults = async () => {
    await api.post('/automations/install-defaults', {})
    toast('Default automations installed')
    refresh()
  }

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this automation?')) return
    await api.del(`/automations/${selected.id}`)
    toast('Automation deleted')
    setSelected(null)
    refresh()
  }

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.post('/automations', {
      name: fd.get('name'),
      trigger: fd.get('trigger'),
      is_active: true,
      conditions: [],
      steps: [{ delay_minutes: 0, action: fd.get('action'), payload: { message: fd.get('message') || '' } }],
    })
    toast('Automation created')
    setShowCreate(false)
    refresh()
  }

  return (
    <>
      <PageHeader
        title="Automations"
        description="Automated workflows that run in the background for your business."
        actions={
          <>
            <Button size="sm" icon={<Download size={14} />} onClick={installDefaults}>Install Defaults</Button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>New automation</Button>
          </>
        }
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 120, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      ) : automations.length === 0 ? (
        <EmptyState
          icon={<Zap size={32} />}
          title="No automations yet"
          description="Install default automations to start handling leads, follow-ups, and reviews automatically."
          action={<Button variant="primary" size="sm" onClick={installDefaults}>Install Defaults</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {automations.map((auto, i) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(auto)}
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'border-color 120ms ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={14} style={{ color: auto.is_active ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string }}>{auto.name}</span>
                </div>
                <Badge variant={auto.is_active ? 'success' : 'default'} dot>
                  {auto.is_active ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>
                {triggerLabels[auto.trigger] || auto.trigger}
              </p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {auto.steps?.map((step, si) => (
                  <Badge key={si}>{actionLabels[step.action] || step.action}</Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <DetailPanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        subtitle={selected ? (triggerLabels[selected.trigger] || selected.trigger) : ''}
        actions={
          <>
            <Button
              size="sm"
              icon={selected?.is_active ? <PowerOff size={14} /> : <Power size={14} />}
              onClick={() => selected && toggleActive(selected)}
            >
              {selected?.is_active ? 'Pause' : 'Activate'}
            </Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {selected && (
          <div>
            <DetailRow label="Status"><Badge variant={selected.is_active ? 'success' : 'default'} dot>{selected.is_active ? 'Active' : 'Paused'}</Badge></DetailRow>
            <DetailRow label="Trigger"><Badge variant="primary">{selected.trigger}</Badge></DetailRow>
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string, color: 'var(--color-text-secondary)', marginBottom: 12, display: 'block' }}>
                Workflow Steps
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.steps?.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--color-bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        fontSize: 'var(--text-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'var(--weight-medium)' as string,
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' as string }}>
                        {actionLabels[step.action] || step.action}
                      </span>
                      {step.delay_minutes > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                          <Clock size={10} />
                          {step.delay_minutes >= 60 ? `${Math.round(step.delay_minutes / 60)}h delay` : `${step.delay_minutes}m delay`}
                        </span>
                      )}
                    </div>
                    {step.payload?.message && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', paddingLeft: 26, lineHeight: 1.4 }}>
                        "{step.payload.message}"
                      </p>
                    )}
                    {i < (selected.steps?.length ?? 0) - 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                        <ArrowRight size={12} style={{ transform: 'rotate(90deg)' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailPanel>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Automation">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input name="name" label="Name" required placeholder="e.g., Lead Follow-up" />
          <Select name="trigger" label="Trigger">
            {Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select name="action" label="Action">
            {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input name="message" label="Message Template" placeholder="Hi {{contact_name}}..." />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
