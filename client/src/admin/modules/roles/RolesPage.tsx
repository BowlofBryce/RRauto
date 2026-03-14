import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Shield, Building2, Users, UserCheck } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { StatCard } from '../../components/StatCard'
import { InlineBadge } from '../../components/InlineBadge'
import type { BusinessUser, Business } from '../../lib/types'

export function RolesPage() {
  const [users, setUsers] = useState<BusinessUser[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      db.query<BusinessUser>('business_users', { order: { column: 'created_at', ascending: false } }),
      db.query<Business>('businesses', { order: { column: 'name', ascending: true } }),
    ]).then(([u, b]) => {
      setUsers(u)
      setBusinesses(b)
    }).finally(() => setLoading(false))
  }, [])

  const businessMap = useMemo(() => {
    const map: Record<string, string> = {}
    businesses.forEach((b) => { map[b.id] = b.name })
    return map
  }, [businesses])

  const roleCounts = useMemo(() => {
    const map: Record<string, number> = {}
    users.forEach((u) => { map[u.role] = (map[u.role] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [users])

  const roleVariant = (role: string): 'blue' | 'green' | 'amber' | 'rose' | 'gray' => {
    const map: Record<string, 'blue' | 'green' | 'amber' | 'rose' | 'gray'> = {
      owner: 'rose',
      admin: 'blue',
      manager: 'green',
      member: 'gray',
      viewer: 'gray',
    }
    return map[role] || 'gray'
  }

  const uniqueBusinesses = [...new Set(users.map((u) => u.business_id))].length

  return (
    <>
      <AdminPageHeader title="Roles & Permissions" description="View user roles and access assignments across businesses." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total Users" value={loading ? '--' : users.length} icon={<Users size={15} />} />
        <StatCard label="Businesses" value={loading ? '--' : uniqueBusinesses} icon={<Building2 size={15} />} />
        <StatCard label="Unique Roles" value={loading ? '--' : roleCounts.length} icon={<Shield size={15} />} />
        <StatCard label="Owners" value={loading ? '--' : users.filter((u) => u.role === 'owner').length} icon={<UserCheck size={15} />} color="#e11d48" />
      </div>

      {loading ? (
        <div style={{ height: 200, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <AdminSection title="Role Distribution">
            <div>
              {roleCounts.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 12 }}>No roles assigned</div>
              ) : (
                roleCounts.map(([role, count], i) => {
                  const max = roleCounts[0][1]
                  const pct = max > 0 ? (count / max) * 100 : 0
                  return (
                    <motion.div
                      key={role}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Shield size={12} style={{ color: '#aaa' }} />
                          <InlineBadge variant={roleVariant(role)}>{role}</InlineBadge>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{count}</span>
                      </div>
                      <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4 }}
                          style={{ height: '100%', background: '#0f62fe', borderRadius: 2 }}
                        />
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </AdminSection>

          <AdminSection title="Recent Assignments">
            <div>
              {users.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 12 }}>No user assignments</div>
              ) : (
                users.slice(0, 10).map((u, i) => (
                  <motion.div
                    key={`${u.user_id}-${u.business_id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    style={{
                      padding: '9px 16px',
                      borderBottom: '1px solid #f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <Users size={12} style={{ color: '#bbb', flexShrink: 0 }} />
                      <span style={{ color: '#444', fontFamily: 'monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                        {u.user_id.slice(0, 8)}...
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: '#888' }}>{businessMap[u.business_id] || 'Unknown'}</span>
                      <InlineBadge variant={roleVariant(u.role)}>{u.role}</InlineBadge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </AdminSection>
        </div>
      )}
      <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
    </>
  )
}
