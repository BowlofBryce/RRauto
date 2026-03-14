import { useState, useEffect, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader as Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import type { PipelineStage } from '@/lib/types'

export function SettingsPage() {
  const { userEmail } = useAuth()
  const { toast } = useToast()
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<PipelineStage[]>('/pipeline')
      .then(setStages)
      .finally(() => setLoading(false))
  }, [])

  const handlePipelineSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const stageNames = (fd.get('stages') as string).split('\n').map(s => s.trim()).filter(Boolean)
    await api.put('/pipeline', {
      stages: stageNames.map((name, i) => ({ name, stage_order: i })),
    })
    toast('Pipeline stages saved')
    api.get<PipelineStage[]>('/pipeline').then(setStages)
  }

  return (
    <>
      <PageHeader title="Settings" description="Configure your workspace." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
        <Section title="Account">
          <DetailItem label="Email">{userEmail || '--'}</DetailItem>
          <DetailItem label="Role">Business Owner</DetailItem>
        </Section>

        <Section title="Pipeline Stages">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Loading...
            </div>
          ) : (
            <form onSubmit={handlePipelineSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Textarea
                name="stages"
                label="Stage names (one per line)"
                defaultValue={stages.sort((a, b) => a.stage_order - b.stage_order).map(s => s.name).join('\n')}
                style={{ minHeight: 120 }}
              />
              <div>
                <Button type="submit" variant="primary" size="sm" icon={<Save size={14} />}>Save Stages</Button>
              </div>
            </form>
          )}
        </Section>

        <Section title="Service Types">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
            Service types can be configured per job when creating new jobs. Common types include Lawn Mowing, Pressure Washing, Window Washing, Grout Cleaning, and more.
          </p>
        </Section>

        <Section title="Notifications">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
            Notification preferences will be available in a future update. Automations currently handle SMS and email communication.
          </p>
        </Section>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--color-border)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-semibold)' as string,
      }}>
        {title}
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </motion.div>
  )
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 'var(--text-sm)' }}>
      <span style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
      <span style={{ fontWeight: 'var(--weight-medium)' as string }}>{children}</span>
    </div>
  )
}
