import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Puzzle, Zap, TriangleAlert as AlertTriangle, ArrowUpRight, MessageSquare, Activity } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { StatCard } from '../../components/StatCard'
import { AdminSection } from '../../components/AdminCard'
import { InlineBadge } from '../../components/InlineBadge'
import type { Business, AuditLog, Automation } from '../../lib/types'

export function OverviewPage() {
  const [stats, setStats] = useState({ businesses: 0, active: 0, modules: 0, automations: 0, failedQueue: 0 })
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      db.query<Business>('businesses', { order: { column: 'created_at', ascending: false }, limit: 5 }),
      db.count('businesses'),
      db.count('businesses', [{ column: 'status', op: 'eq', value: 'active' }]),
      db.count('platform_modules'),
      db.query<Automation>('automations'),
      db.count('automation_queue', [{ column: 'status', op: 'eq', value: 'failed' }]),
      db.query<AuditLog>('audit_logs', { order: { column: 'created_at', ascending: false }, limit: 8 }),
    ]).then(([biz, total, active, mods, autos, failed, logs]) => {
      setBusinesses(biz)
      setStats({ businesses: total, active, modules: mods, automations: autos.length, failedQueue: failed })
      setRecentLogs(logs)
    }).finally(() => setLoading(false))
  }, [])

  const planMap: Record<string, string> = { essential: 'gray', growth: 'blue', pro: 'green' }

  return (
    <>
      <AdminPageHeader title="Overview" description="Platform operations at a glance." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Businesses" value={loading ? '--' : stats.businesses} icon={<Building2 size={15} />} sub={`${stats.active} active`} />
        <StatCard label="Modules" value={loading ? '--' : stats.modules} icon={<Puzzle size={15} />} />
        <StatCard label="Automations" value={loading ? '--' : stats.automations} icon={<Zap size={15} />} />
        <StatCard label="Failed Runs" value={loading ? '--' : stats.failedQueue} icon={<AlertTriangle size={15} />} color={stats.failedQueue > 0 ? '#e11d48' : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <AdminSection
          title="Recent Businesses"
          actions={
            <Link to="/admin/businesses" style={{ fontSize: 11, color: '#0f62fe', display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
              View all <ArrowUpRight size={11} />
            </Link>
          }
        >
          {businesses.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 12 }}>No businesses yet</div>
          ) : (
            businesses.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ padding: '9px 14px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={13} style={{ color: '#aaa' }} />
                  <Link to={`/admin/businesses/${b.id}`} style={{ fontWeight: 500, color: '#222', textDecoration: 'none' }}>{b.name}</Link>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <InlineBadge variant={(planMap[b.plan] ?? 'gray') as 'gray' | 'blue' | 'green'}>{b.plan}</InlineBadge>
                  <InlineBadge variant={b.status === 'active' ? 'green' : 'amber'} dot>{b.status}</InlineBadge>
                </div>
              </motion.div>
            ))
          )}
        </AdminSection>

        <AdminSection
          title="Audit Log"
          actions={
            <Link to="/admin/diagnostics" style={{ fontSize: 11, color: '#0f62fe', display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
              View all <ArrowUpRight size={11} />
            </Link>
          }
        >
          {recentLogs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 12 }}>No activity yet</div>
          ) : (
            recentLogs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ padding: '8px 14px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
              >
                <Activity size={12} style={{ color: '#bbb', flexShrink: 0 }} />
                <span style={{ color: '#555', flex: 1 }}>{log.action}</span>
                <span style={{ color: '#bbb', fontSize: 11, flexShrink: 0 }}>
                  {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </motion.div>
            ))
          )}
        </AdminSection>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}
      >
        <QuickAction to="/admin/businesses" icon={<Building2 size={15} />} label="Manage Businesses" />
        <QuickAction to="/admin/automations" icon={<Zap size={15} />} label="View Automations" />
        <QuickAction to="/admin/messaging" icon={<MessageSquare size={15} />} label="Messaging Templates" />
      </motion.div>
    </>
  )
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div
        style={{
          padding: '12px 14px',
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12.5,
          fontWeight: 500,
          color: '#333',
          transition: 'border-color 100ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ccc' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5' }}
      >
        <span style={{ color: '#888' }}>{icon}</span>
        {label}
        <ArrowUpRight size={12} style={{ marginLeft: 'auto', color: '#bbb' }} />
      </div>
    </Link>
  )
}
