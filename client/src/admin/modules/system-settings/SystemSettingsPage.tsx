import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings2, Globe, Database, Shield } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { useAuth } from '@/lib/auth'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { StatCard } from '../../components/StatCard'

export function SystemSettingsPage() {
  const { userEmail } = useAuth()
  const [counts, setCounts] = useState({ businesses: 0, modules: 0, flags: 0, templates: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      db.count('businesses'),
      db.count('platform_modules'),
      db.count('feature_flags'),
      db.count('messaging_templates'),
    ]).then(([businesses, modules, flags, templates]) => {
      setCounts({ businesses, modules, flags, templates })
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <AdminPageHeader title="System Settings" description="Global platform configuration and system information." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Businesses" value={loading ? '--' : counts.businesses} icon={<Globe size={15} />} />
        <StatCard label="Modules" value={loading ? '--' : counts.modules} icon={<Database size={15} />} />
        <StatCard label="Feature Flags" value={loading ? '--' : counts.flags} icon={<Shield size={15} />} />
        <StatCard label="Templates" value={loading ? '--' : counts.templates} icon={<Settings2 size={15} />} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 600 }}>
        <AdminSection title="Platform Info">
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SettingRow label="Platform" value="ServiceOS" />
            <SettingRow label="Version" value="1.0.0" />
            <SettingRow label="Environment" value="Production" />
            <SettingRow label="Admin User" value={userEmail || '--'} />
          </div>
        </AdminSection>

        <AdminSection title="Default Configuration">
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SettingRow label="Default Timezone" value="America/New_York" />
            <SettingRow label="Default Plan" value="essential" />
            <SettingRow label="Email Confirmation" value="Disabled" />
            <SettingRow label="Auto-provisioning" value="Enabled" />
          </div>
        </AdminSection>

        <AdminSection title="Database">
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SettingRow label="Provider" value="Supabase (PostgreSQL)" />
            <SettingRow label="RLS" value="Enabled" />
            <SettingRow label="Connection" value="Healthy" valueColor="#15803d" />
          </div>
        </AdminSection>
      </div>
    </>
  )
}

function SettingRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}
    >
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ fontWeight: 500, color: valueColor || '#333', display: 'flex', alignItems: 'center', gap: 4 }}>
        {value === 'Healthy' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803d' }} />}
        {value}
      </span>
    </motion.div>
  )
}
