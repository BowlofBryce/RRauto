import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Building2, TrendingUp } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { StatCard } from '../../components/StatCard'
import { InlineBadge } from '../../components/InlineBadge'
import type { Business } from '../../lib/types'

export function BillingPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.query<Business>('businesses', { order: { column: 'name', ascending: true } })
      .then(setBusinesses)
      .finally(() => setLoading(false))
  }, [])

  const planCounts = useMemo(() => {
    const map: Record<string, number> = {}
    businesses.forEach((b) => { map[b.plan] = (map[b.plan] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [businesses])

  const planVariant = (plan: string): 'gray' | 'blue' | 'green' => {
    if (plan === 'growth') return 'blue'
    if (plan === 'pro') return 'green'
    return 'gray'
  }

  const active = businesses.filter((b) => b.status === 'active').length

  return (
    <>
      <AdminPageHeader title="Billing" description="Plan assignments and billing overview." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total Businesses" value={loading ? '--' : businesses.length} icon={<Building2 size={15} />} />
        <StatCard label="Active" value={loading ? '--' : active} icon={<TrendingUp size={15} />} color="#15803d" />
        {planCounts.slice(0, 2).map(([plan, count]) => (
          <StatCard key={plan} label={`${plan} Plan`} value={loading ? '--' : count} icon={<CreditCard size={15} />} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <AdminSection title="Plan Distribution">
          <div>
            {planCounts.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 12 }}>No data</div>
            ) : (
              planCounts.map(([plan, count], i) => {
                const max = planCounts[0][1]
                const pct = max > 0 ? (count / max) * 100 : 0
                return (
                  <motion.div
                    key={plan}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <InlineBadge variant={planVariant(plan)}>{plan}</InlineBadge>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4 }}
                        style={{ height: '100%', background: plan === 'pro' ? '#15803d' : plan === 'growth' ? '#0f62fe' : '#888', borderRadius: 2 }}
                      />
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </AdminSection>

        <AdminSection title="Businesses by Plan">
          <div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ height: 12, borderRadius: 3, background: '#f0f0f0', width: '50%', animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
                </div>
              ))
            ) : (
              businesses.slice(0, 12).map((biz, i) => (
                <motion.div
                  key={biz.id}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 size={12} style={{ color: '#bbb' }} />
                    <span style={{ color: '#333', fontWeight: 500 }}>{biz.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <InlineBadge variant={planVariant(biz.plan)}>{biz.plan}</InlineBadge>
                    <InlineBadge variant={biz.status === 'active' ? 'green' : 'amber'} dot>{biz.status}</InlineBadge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </AdminSection>
      </div>
      <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
    </>
  )
}
