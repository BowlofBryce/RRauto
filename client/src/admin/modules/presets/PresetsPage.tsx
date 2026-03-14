import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Check, X } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { ToggleSwitch } from '../../components/ToggleSwitch'
import { InlineBadge } from '../../components/InlineBadge'
import { useToast } from '@/components/ui/Toast'
import type { Preset } from '../../lib/types'

export function PresetsPage() {
  const { toast } = useToast()
  const [presets, setPresets] = useState<Preset[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    db.query<Preset>('presets', { order: { column: 'sort_order', ascending: true } })
      .then(setPresets)
      .finally(() => setLoading(false))
  }, [])

  const toggleActive = async (preset: Preset) => {
    const updated = !preset.is_active
    setPresets((prev) => prev.map((p) => p.id === preset.id ? { ...p, is_active: updated } : p))
    await db.update('presets', preset.id, { is_active: updated })
    toast(`${preset.name} ${updated ? 'activated' : 'deactivated'}`)
  }

  const categories = [...new Set(presets.map((p) => p.category))]

  const categoryLabels: Record<string, string> = {
    industry: 'Industry Presets',
    plan: 'Plan Presets',
  }

  return (
    <>
      <AdminPageHeader title="Presets" description="Manage onboarding presets for industries and plans." />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: 160, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {categories.map((cat) => (
            <AdminSection key={cat} title={categoryLabels[cat] || cat} description={`${presets.filter((p) => p.category === cat).length} presets`}>
              <div>
                {presets.filter((p) => p.category === cat).map((preset, i) => (
                  <div key={preset.id}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setExpandedId(expandedId === preset.id ? null : preset.id)}
                      style={{
                        padding: '11px 16px',
                        borderBottom: expandedId === preset.id ? 'none' : '1px solid #f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        gap: 12,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <Package size={14} style={{ color: '#888', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: '#222' }}>{preset.name}</div>
                          <div style={{ fontSize: 11, color: '#999' }}>{preset.description}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <InlineBadge variant={preset.is_active ? 'green' : 'gray'}>
                          {preset.is_active ? <><Check size={10} /> Active</> : <><X size={10} /> Inactive</>}
                        </InlineBadge>
                        <ToggleSwitch checked={preset.is_active} onChange={() => toggleActive(preset)} size="sm" />
                      </div>
                    </motion.div>

                    {expandedId === preset.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', overflow: 'hidden', padding: '12px 16px 12px 42px' }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                          Configuration
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {preset.config.modules && (
                            <ConfigItem label="Modules" values={preset.config.modules} />
                          )}
                          {preset.config.service_types && (
                            <ConfigItem label="Service Types" values={preset.config.service_types} />
                          )}
                          {preset.config.pipeline_stages && (
                            <ConfigItem label="Pipeline Stages" values={preset.config.pipeline_stages} />
                          )}
                          {preset.config.max_contacts !== undefined && (
                            <div>
                              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Max Contacts</div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{preset.config.max_contacts}</div>
                            </div>
                          )}
                          {preset.config.max_automations !== undefined && (
                            <div>
                              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Max Automations</div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{preset.config.max_automations}</div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </AdminSection>
          ))}
        </div>
      )}
    </>
  )
}

function ConfigItem({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {values.map((v) => (
          <InlineBadge key={v} variant="blue">{v}</InlineBadge>
        ))}
      </div>
    </div>
  )
}
