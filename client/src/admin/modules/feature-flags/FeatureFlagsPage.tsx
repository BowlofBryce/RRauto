import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flag, Globe, Building2 } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { ToggleSwitch } from '../../components/ToggleSwitch'
import { InlineBadge } from '../../components/InlineBadge'
import { useToast } from '@/components/ui/Toast'
import type { FeatureFlag, BusinessFeatureFlag, Business } from '../../lib/types'

export function FeatureFlagsPage() {
  const { toast } = useToast()
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [overrides, setOverrides] = useState<BusinessFeatureFlag[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      db.query<FeatureFlag>('feature_flags', { order: { column: 'name', ascending: true } }),
      db.query<BusinessFeatureFlag>('business_feature_flags'),
      db.query<Business>('businesses', { order: { column: 'name', ascending: true } }),
    ]).then(([f, o, b]) => {
      setFlags(f)
      setOverrides(o)
      setBusinesses(b)
    }).finally(() => setLoading(false))
  }, [])

  const toggleGlobalDefault = async (flag: FeatureFlag) => {
    const updated = !flag.default_enabled
    setFlags((prev) => prev.map((f) => f.id === flag.id ? { ...f, default_enabled: updated } : f))
    await db.update('feature_flags', flag.id, { default_enabled: updated })
    toast(`${flag.name} default ${updated ? 'enabled' : 'disabled'}`)
  }

  const toggleBusinessOverride = async (flagId: string, businessId: string, currentEnabled: boolean) => {
    const newVal = !currentEnabled
    setOverrides((prev) => {
      const existing = prev.find((o) => o.flag_id === flagId && o.business_id === businessId)
      if (existing) return prev.map((o) => o.flag_id === flagId && o.business_id === businessId ? { ...o, enabled: newVal } : o)
      return [...prev, { flag_id: flagId, business_id: businessId, enabled: newVal }]
    })
    await db.upsert('business_feature_flags', { flag_id: flagId, business_id: businessId, enabled: newVal }, 'business_id,flag_id')
    toast(`Override updated`)
  }

  const getOverride = (flagId: string, businessId: string) =>
    overrides.find((o) => o.flag_id === flagId && o.business_id === businessId)

  const globalFlags = flags.filter((f) => f.is_global)
  const moduleFlags = flags.filter((f) => !f.is_global)

  return (
    <>
      <AdminPageHeader
        title="Feature Flags"
        description="Control feature availability globally and per business."
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: 180, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FlagSection
            title="Global Flags"
            description="Apply across all businesses"
            flags={globalFlags}
            expandedFlag={expandedFlag}
            setExpandedFlag={setExpandedFlag}
            toggleGlobalDefault={toggleGlobalDefault}
            businesses={businesses}
            getOverride={getOverride}
            toggleBusinessOverride={toggleBusinessOverride}
          />
          <FlagSection
            title="Module Flags"
            description="Module-specific feature toggles"
            flags={moduleFlags}
            expandedFlag={expandedFlag}
            setExpandedFlag={setExpandedFlag}
            toggleGlobalDefault={toggleGlobalDefault}
            businesses={businesses}
            getOverride={getOverride}
            toggleBusinessOverride={toggleBusinessOverride}
          />
        </div>
      )}
    </>
  )
}

function FlagSection({ title, description, flags, expandedFlag, setExpandedFlag, toggleGlobalDefault, businesses, getOverride, toggleBusinessOverride }: {
  title: string
  description: string
  flags: FeatureFlag[]
  expandedFlag: string | null
  setExpandedFlag: (id: string | null) => void
  toggleGlobalDefault: (flag: FeatureFlag) => void
  businesses: Business[]
  getOverride: (flagId: string, businessId: string) => BusinessFeatureFlag | undefined
  toggleBusinessOverride: (flagId: string, businessId: string, current: boolean) => void
}) {
  if (flags.length === 0) return null
  return (
    <AdminSection title={title} description={description}>
      <div>
        {flags.map((flag, i) => (
          <div key={flag.id}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setExpandedFlag(expandedFlag === flag.id ? null : flag.id)}
              style={{
                padding: '11px 16px',
                borderBottom: expandedFlag === flag.id ? 'none' : '1px solid #f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                gap: 12,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                {flag.is_global ? <Globe size={13} style={{ color: '#0f62fe', flexShrink: 0 }} /> : <Flag size={13} style={{ color: '#888', flexShrink: 0 }} />}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: '#222' }}>{flag.name}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{flag.description}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <InlineBadge variant={flag.default_enabled ? 'green' : 'gray'}>
                  {flag.default_enabled ? 'On' : 'Off'}
                </InlineBadge>
                <ToggleSwitch checked={flag.default_enabled} onChange={() => toggleGlobalDefault(flag)} size="sm" />
              </div>
            </motion.div>

            {expandedFlag === flag.id && businesses.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.15 }}
                style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', overflow: 'hidden' }}
              >
                <div style={{ padding: '8px 16px 4px 42px', fontSize: 10, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Per-business overrides
                </div>
                {businesses.map((biz) => {
                  const override = getOverride(flag.id, biz.id)
                  const effective = override ? override.enabled : flag.default_enabled
                  return (
                    <div
                      key={biz.id}
                      style={{ padding: '7px 16px 7px 42px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={11} style={{ color: '#bbb' }} />
                        <span style={{ color: '#444' }}>{biz.name}</span>
                        {override && <InlineBadge variant="amber">override</InlineBadge>}
                      </div>
                      <ToggleSwitch checked={effective} onChange={() => toggleBusinessOverride(flag.id, biz.id, effective)} size="sm" />
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </AdminSection>
  )
}
