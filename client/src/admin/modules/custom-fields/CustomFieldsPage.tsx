import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FolderInput as FormInput, Building2, Hash, Type, Calendar, ToggleLeft, List } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { StatCard } from '../../components/StatCard'
import { InlineBadge } from '../../components/InlineBadge'
import type { CustomField, Business } from '../../lib/types'

export function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      db.query<CustomField>('custom_fields', { order: { column: 'sort_order', ascending: true } }),
      db.query<Business>('businesses', { order: { column: 'name', ascending: true } }),
    ]).then(([f, b]) => {
      setFields(f)
      setBusinesses(b)
    }).finally(() => setLoading(false))
  }, [])

  const businessMap = useMemo(() => {
    const map: Record<string, string> = {}
    businesses.forEach((b) => { map[b.id] = b.name })
    return map
  }, [businesses])

  const entities = [...new Set(fields.map((f) => f.entity))]
  const typeCount = [...new Set(fields.map((f) => f.field_type))].length

  const typeIcon = (t: string) => {
    const icons: Record<string, React.ReactNode> = {
      text: <Type size={11} />,
      number: <Hash size={11} />,
      date: <Calendar size={11} />,
      boolean: <ToggleLeft size={11} />,
      select: <List size={11} />,
    }
    return icons[t] || <FormInput size={11} />
  }

  const typeVariant = (t: string): 'blue' | 'green' | 'amber' | 'gray' => {
    const map: Record<string, 'blue' | 'green' | 'amber' | 'gray'> = {
      text: 'blue',
      number: 'green',
      date: 'amber',
      boolean: 'gray',
      select: 'blue',
    }
    return map[t] || 'gray'
  }

  return (
    <>
      <AdminPageHeader title="Custom Fields" description="View custom field definitions across businesses." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total Fields" value={loading ? '--' : fields.length} icon={<FormInput size={15} />} />
        <StatCard label="Entities" value={loading ? '--' : entities.length} icon={<List size={15} />} />
        <StatCard label="Field Types" value={loading ? '--' : typeCount} icon={<Hash size={15} />} />
        <StatCard label="Required" value={loading ? '--' : fields.filter((f) => f.is_required).length} icon={<FormInput size={15} />} color="#e11d48" />
      </div>

      {loading ? (
        <div style={{ height: 200, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
      ) : fields.length === 0 ? (
        <AdminSection title="Custom Fields" description="No custom fields defined">
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>
            Businesses have not defined any custom fields yet.
          </div>
        </AdminSection>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entities.map((entity) => (
            <AdminSection key={entity} title={entity} description={`${fields.filter((f) => f.entity === entity).length} fields`}>
              <div>
                {fields.filter((f) => f.entity === entity).map((field, i) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <FormInput size={13} style={{ color: '#aaa', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: '#222' }}>{field.field_name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#999' }}>
                          <Building2 size={10} />
                          {businessMap[field.business_id] || field.business_id}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <InlineBadge variant={typeVariant(field.field_type)}>
                        {typeIcon(field.field_type)} {field.field_type}
                      </InlineBadge>
                      {field.is_required && <InlineBadge variant="red">required</InlineBadge>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AdminSection>
          ))}
        </div>
      )}
      <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
    </>
  )
}
