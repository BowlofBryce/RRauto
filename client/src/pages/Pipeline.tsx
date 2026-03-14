import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings2, Plus, GripVertical, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Lead, PipelineStage } from '@/lib/types'

export function PipelinePage() {
  const { toast } = useToast()
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfigure, setShowConfigure] = useState(false)
  const [editStages, setEditStages] = useState<string[]>([])

  const loadData = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get<PipelineStage[]>('/pipeline'),
      api.get<Lead[]>('/leads'),
    ]).then(([s, l]) => {
      setStages(s)
      setLeads(l)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const leadsInStage = (stageName: string) =>
    leads.filter((l) => l.pipeline_stage === stageName && l.status !== 'lost')

  const advanceLead = async (lead: Lead, nextStage: string) => {
    await api.patch(`/leads/${lead.id}`, { pipeline_stage: nextStage })
    toast(`Lead moved to ${nextStage}`)
    loadData()
  }

  const openConfigure = () => {
    setEditStages(stages.map((s) => s.name))
    setShowConfigure(true)
  }

  const saveStages = async () => {
    const stageList = editStages.filter(Boolean).map((name, i) => ({ name, stage_order: i }))
    await api.put('/pipeline', { stages: stageList })
    toast('Pipeline stages saved')
    setShowConfigure(false)
    loadData()
  }

  const installDefaults = async () => {
    await api.put('/pipeline', {
      stages: [
        { name: 'New', stage_order: 0 },
        { name: 'Contacted', stage_order: 1 },
        { name: 'Proposal', stage_order: 2 },
        { name: 'Negotiation', stage_order: 3 },
        { name: 'Closed', stage_order: 4 },
      ],
    })
    toast('Default stages installed')
    loadData()
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Pipeline" />
        <div style={{ display: 'flex', gap: 16, overflow: 'auto' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ minWidth: 260, height: 300, background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Pipeline"
        description={`${stages.length} stages, ${leads.filter(l => l.status !== 'lost').length} active leads`}
        actions={
          <Button size="sm" icon={<Settings2 size={14} />} onClick={openConfigure}>
            Configure
          </Button>
        }
      />

      {stages.length === 0 ? (
        <EmptyState
          icon={<GripVertical size={32} />}
          title="No pipeline stages"
          description="Set up your pipeline stages to start tracking leads through your sales process."
          action={<Button variant="primary" size="sm" onClick={installDefaults}>Install Default Stages</Button>}
        />
      ) : (
        <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 8, alignItems: 'flex-start' }}>
          {stages.sort((a, b) => a.stage_order - b.stage_order).map((stage, stageIdx) => {
            const stageLeads = leadsInStage(stage.name)
            return (
              <div
                key={stage.id}
                style={{
                  minWidth: 260,
                  maxWidth: 260,
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 180px)',
                }}
              >
                <div style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string }}>{stage.name}</span>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    background: 'var(--color-bg-muted)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 'var(--weight-medium)' as string,
                  }}>
                    {stageLeads.length}
                  </span>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'auto', flex: 1 }}>
                  <AnimatePresence>
                    {stageLeads.map((lead) => {
                      const nextStage = stages[stageIdx + 1]
                      return (
                        <motion.div
                          key={lead.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            background: 'var(--color-bg-elevated)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 12px',
                            cursor: nextStage ? 'pointer' : 'default',
                          }}
                          onClick={() => nextStage && advanceLead(lead, nextStage.name)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <StatusBadge status={lead.status} />
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                              {lead.source}
                            </span>
                          </div>
                          {lead.assigned_to && (
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                              {lead.assigned_to}
                            </div>
                          )}
                          {nextStage && (
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', marginTop: 6 }}>
                              Click to advance
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  {stageLeads.length === 0 && (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                      No leads
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showConfigure} onClose={() => setShowConfigure(false)} title="Configure Pipeline Stages" width={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {editStages.map((name, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GripVertical size={14} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
              <Input
                value={name}
                onChange={(e) => {
                  const copy = [...editStages]
                  copy[i] = (e.target as HTMLInputElement).value
                  setEditStages(copy)
                }}
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setEditStages(editStages.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', display: 'flex', padding: 4 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setEditStages([...editStages, ''])}>
            Add Stage
          </Button>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button onClick={() => setShowConfigure(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveStages}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
