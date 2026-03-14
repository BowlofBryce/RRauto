import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Clock } from 'lucide-react'
import { useBusiness } from '../context/BusinessContext'
import { getLeads, createLead, updateLead } from '../modules/leads/leads.service'
import { getPipelineStages } from '../core/pipeline/pipeline.service'
import { getContacts } from '../modules/contacts/contacts.service'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { formatRelative } from '../lib/utils'
import type { LeadWithContact } from '../modules/leads/leads.service'
import type { PipelineStage, Contact } from '../types/crm.types'

const sources = [
  { value: 'manual', label: 'Manual' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
]

export function Pipeline() {
  const { business } = useBusiness()
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leads, setLeads] = useState<LeadWithContact[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ contact_id: '', source: 'manual', pipeline_stage_id: '' })
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const load = async () => {
    if (!business) return
    setLoading(true)
    const [s, l, c] = await Promise.all([
      getPipelineStages(business.id),
      getLeads(business.id),
      getContacts(business.id),
    ])
    setStages(s)
    setLeads(l)
    setContacts(c)
    if (s.length > 0) setForm((f) => ({ ...f, pipeline_stage_id: s[0].id }))
    setLoading(false)
  }

  useEffect(() => { load() }, [business])

  const leadsFor = (stageId: string) => leads.filter((l) => l.pipeline_stage_id === stageId)

  const handleCreate = async () => {
    if (!business || !form.contact_id) return
    setSaving(true)
    await createLead({
      business_id: business.id,
      contact_id: form.contact_id,
      source: form.source,
      pipeline_stage_id: form.pipeline_stage_id || null,
    })
    setSaving(false)
    setAddOpen(false)
    load()
  }

  const handleDrop = async (leadId: string, stageId: string) => {
    setLeads((p) => p.map((l) => l.id === leadId ? { ...l, pipeline_stage_id: stageId } : l))
    await updateLead(leadId, { pipeline_stage_id: stageId })
    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Pipeline"
        description={`${leads.length} open leads`}
        actions={
          <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add Lead
          </Button>
        }
      />

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-60">
              <Skeleton className="h-6 w-28 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, j) => <Skeleton key={j} className="h-20 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
          {stages.map((stage) => {
            const stageLeads = leadsFor(stage.id)
            const isOver = dragOver === stage.id
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-60"
                onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => { e.preventDefault(); if (dragging) handleDrop(dragging, stage.id) }}
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                  <span className="text-[10px] font-semibold text-2 uppercase tracking-widest">
                    {stage.name}
                  </span>
                  <span className="ml-auto text-xs text-4 tabular-nums">{stageLeads.length}</span>
                </div>

                <motion.div
                  layout
                  className={`min-h-28 rounded-xl space-y-2 p-1.5 transition-colors duration-150 ${
                    isOver ? 'bg-subtle' : 'bg-app'
                  }`}
                >
                  <AnimatePresence>
                    {stageLeads.map((lead) => (
                      <motion.div
                        key={lead.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                        draggable
                        onDragStart={() => setDragging(lead.id)}
                        onDragEnd={() => { setDragging(null); setDragOver(null) }}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className={`bg-raised border border-app rounded-lg p-3 cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-app-sm ${
                          dragging === lead.id ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Avatar name={lead.contacts.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-1 truncate">{lead.contacts.name}</p>
                            {lead.contacts.phone && (
                              <p className="text-[11px] text-4 truncate mt-0.5">{lead.contacts.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                          <Badge variant="neutral">{lead.source}</Badge>
                          <span className="flex items-center gap-1 text-[10px] text-4">
                            <Clock size={9} />{formatRelative(lead.created_at)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {stageLeads.length === 0 && (
                    <div className="flex items-center justify-center h-14">
                      <p className="text-xs text-4">Drop leads here</p>
                    </div>
                  )}
                </motion.div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Lead">
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-2">Contact *</label>
            <select
              value={form.contact_id}
              onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              className="input-base h-8 px-3 rounded-lg text-[13px] focus:outline-none"
            >
              <option value="">Select contact...</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-2">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="input-base h-8 px-3 rounded-lg text-[13px] focus:outline-none"
              >
                {sources.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-2">Stage</label>
              <select
                value={form.pipeline_stage_id}
                onChange={(e) => setForm({ ...form, pipeline_stage_id: e.target.value })}
                className="input-base h-8 px-3 rounded-lg text-[13px] focus:outline-none"
              >
                {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>Add Lead</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
