import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap, Building2, Clock, Play, Pause } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { StatCard } from '../../components/StatCard'
import { InlineBadge } from '../../components/InlineBadge'
import { ToggleSwitch } from '../../components/ToggleSwitch'
import { useToast } from '@/components/ui/Toast'
import type { Automation, Business } from '../../lib/types'

export function AutomationsAdminPage() {
  const { toast } = useToast()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')

  useEffect(() => {
    Promise.all([
      db.query<Automation>('automations', { order: { column: 'created_at', ascending: false } }),
      db.query<Business>('businesses', { order: { column: 'name', ascending: true } }),
    ]).then(([a, b]) => {
      setAutomations(a)
      setBusinesses(b)
    }).finally(() => setLoading(false))
  }, [])

  const businessMap = useMemo(() => {
    const map: Record<string, string> = {}
    businesses.forEach((b) => { map[b.id] = b.name })
    return map
  }, [businesses])

  const filtered = useMemo(() => {
    if (filter === 'active') return automations.filter((a) => a.is_active)
    if (filter === 'paused') return automations.filter((a) => !a.is_active)
    return automations
  }, [automations, filter])

  const toggleAutomation = async (auto: Automation) => {
    const updated = !auto.is_active
    setAutomations((prev) => prev.map((a) => a.id === auto.id ? { ...a, is_active: updated } : a))
    await db.update('automations', auto.id, { is_active: updated })
    toast(`${auto.name} ${updated ? 'activated' : 'paused'}`)
  }

  const active = automations.filter((a) => a.is_active).length
  const uniqueTriggers = [...new Set(automations.map((a) => a.trigger))].length

  return (
    <>
      <AdminPageHeader title="Automations" description="Manage automation workflows across all businesses." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total" value={loading ? '--' : automations.length} icon={<Zap size={15} />} />
        <StatCard label="Active" value={loading ? '--' : active} icon={<Play size={15} />} color="#15803d" />
        <StatCard label="Paused" value={loading ? '--' : automations.length - active} icon={<Pause size={15} />} />
        <StatCard label="Triggers" value={loading ? '--' : uniqueTriggers} icon={<Clock size={15} />} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['all', 'active', 'paused'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: '1px solid',
              borderColor: filter === f ? '#0f62fe' : '#e5e5e5',
              background: filter === f ? '#eff6ff' : '#fff',
              color: filter === f ? '#0f62fe' : '#666',
              fontSize: 11.5,
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <AdminSection title="Workflows" description={`${filtered.length} automations`}>
        <div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ height: 12, borderRadius: 3, background: '#f0f0f0', width: '40%', animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>No automations found</div>
          ) : (
            filtered.map((auto, i) => (
              <motion.div
                key={auto.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  padding: '11px 16px',
                  borderBottom: '1px solid #f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <Zap size={13} style={{ color: auto.is_active ? '#0f62fe' : '#ccc', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: '#222' }}>{auto.name}</div>
                    <div style={{ fontSize: 11, color: '#999', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>trigger: {auto.trigger}</span>
                      {auto.steps && <span>{auto.steps.length} step{auto.steps.length !== 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#aaa' }}>
                    <Building2 size={11} />
                    {businessMap[auto.business_id] || 'Unknown'}
                  </div>
                  <InlineBadge variant={auto.is_active ? 'green' : 'gray'} dot>
                    {auto.is_active ? 'Active' : 'Paused'}
                  </InlineBadge>
                  <ToggleSwitch checked={auto.is_active} onChange={() => toggleAutomation(auto)} size="sm" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AdminSection>
      <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
    </>
  )
}
