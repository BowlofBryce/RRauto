import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Save } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { useToast } from '@/components/ui/Toast'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { InlineBadge } from '../../components/InlineBadge'
import { ToggleSwitch } from '../../components/ToggleSwitch'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import type { Business, PlatformModule, BusinessModule } from '../../lib/types'

export function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [business, setBusiness] = useState<Business | null>(null)
  const [modules, setModules] = useState<PlatformModule[]>([])
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      db.from('businesses').select('*').eq('id', id).maybeSingle(),
      db.query<PlatformModule>('platform_modules', { order: { column: 'sort_order', ascending: true } }),
      db.query<BusinessModule>('business_modules', { filters: [{ column: 'business_id', op: 'eq', value: id }] }),
    ]).then(([{ data: biz }, mods, bm]) => {
      setBusiness(biz as Business)
      setModules(mods)
      const map: Record<string, boolean> = {}
      for (const m of mods) map[m.id] = m.is_default
      for (const entry of bm) map[entry.module_id] = entry.enabled
      setEnabledModules(map)
    }).finally(() => setLoading(false))
  }, [id])

  const toggleModule = async (moduleId: string, enabled: boolean) => {
    if (!id) return
    setEnabledModules((prev) => ({ ...prev, [moduleId]: enabled }))
    await db.upsert('business_modules', { business_id: id, module_id: moduleId, enabled, enabled_at: new Date().toISOString() }, 'business_id,module_id')
    toast(`Module ${enabled ? 'enabled' : 'disabled'}`)
  }

  const saveBusiness = async () => {
    if (!business || !id) return
    await db.update('businesses', id, {
      name: business.name,
      slug: business.slug,
      timezone: business.timezone,
      plan: business.plan,
      status: business.status,
    })
    toast('Business updated')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#aaa' }}>
        Loading...
      </div>
    )
  }

  if (!business) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Business not found</div>
  }

  return (
    <>
      <Link to="/admin/businesses" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', textDecoration: 'none', marginBottom: 12 }}>
        <ArrowLeft size={13} /> Back to Businesses
      </Link>

      <AdminPageHeader
        title={business.name}
        badge={<InlineBadge variant={business.status === 'active' ? 'green' : 'amber'} dot>{business.status}</InlineBadge>}
        actions={
          <Button variant="primary" size="sm" icon={<Save size={13} />} onClick={saveBusiness}>
            Save Changes
          </Button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AdminSection title="Profile" description="Basic business information">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
          >
            <Input label="Business Name" value={business.name} onChange={(e) => setBusiness({ ...business, name: (e.target as HTMLInputElement).value })} />
            <Input label="Slug" value={business.slug} onChange={(e) => setBusiness({ ...business, slug: (e.target as HTMLInputElement).value })} />
            <Input label="Timezone" value={business.timezone} onChange={(e) => setBusiness({ ...business, timezone: (e.target as HTMLInputElement).value })} />
            <Select label="Plan" value={business.plan} onChange={(e) => setBusiness({ ...business, plan: (e.target as HTMLSelectElement).value })}>
              <option value="essential">Essential</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
            </Select>
            <Select label="Status" value={business.status} onChange={(e) => setBusiness({ ...business, status: (e.target as HTMLSelectElement).value })}>
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </Select>
          </motion.div>
        </AdminSection>

        <AdminSection title="Modules" description="Enable or disable modules for this business">
          <div>
            {modules.map((mod) => (
              <div
                key={mod.id}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid #f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building2 size={13} style={{ color: '#aaa' }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: '#222' }}>{mod.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{mod.description}</div>
                  </div>
                </div>
                <ToggleSwitch checked={enabledModules[mod.id] ?? false} onChange={(v) => toggleModule(mod.id, v)} size="sm" />
              </div>
            ))}
          </div>
        </AdminSection>
      </div>
    </>
  )
}
