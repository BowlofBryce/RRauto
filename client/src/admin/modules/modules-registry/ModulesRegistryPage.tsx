import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Puzzle, Check, X } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { ToggleSwitch } from '../../components/ToggleSwitch'
import { InlineBadge } from '../../components/InlineBadge'
import { useToast } from '@/components/ui/Toast'
import type { PlatformModule } from '../../lib/types'

export function ModulesRegistryPage() {
  const { toast } = useToast()
  const [modules, setModules] = useState<PlatformModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.query<PlatformModule>('platform_modules', { order: { column: 'sort_order', ascending: true } })
      .then(setModules)
      .finally(() => setLoading(false))
  }, [])

  const toggleDefault = async (mod: PlatformModule) => {
    const updated = !mod.is_default
    setModules((prev) => prev.map((m) => m.id === mod.id ? { ...m, is_default: updated } : m))
    await db.update('platform_modules', mod.id, { is_default: updated })
    toast(`${mod.name} ${updated ? 'enabled' : 'disabled'} by default`)
  }

  const categories = [...new Set(modules.map((m) => m.category))]

  return (
    <>
      <AdminPageHeader
        title="Modules Registry"
        description="Manage platform modules available to businesses."
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: 200, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {categories.map((cat) => (
            <AdminSection key={cat} title={cat} description={`${modules.filter((m) => m.category === cat).length} modules`}>
              <div>
                {modules.filter((m) => m.category === cat).map((mod, i) => (
                  <motion.div
                    key={mod.id}
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
                      <Puzzle size={14} style={{ color: '#aaa', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: '#222' }}>{mod.name}</div>
                        <div style={{ fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {mod.description}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      {mod.depends_on && mod.depends_on.length > 0 && (
                        <span style={{ fontSize: 10, color: '#aaa' }}>
                          depends: {mod.depends_on.join(', ')}
                        </span>
                      )}
                      <InlineBadge variant={mod.is_default ? 'green' : 'gray'}>
                        {mod.is_default ? <><Check size={10} /> Default</> : <><X size={10} /> Off</>}
                      </InlineBadge>
                      <ToggleSwitch checked={mod.is_default} onChange={() => toggleDefault(mod)} size="sm" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </AdminSection>
          ))}
        </div>
      )}
    </>
  )
}
