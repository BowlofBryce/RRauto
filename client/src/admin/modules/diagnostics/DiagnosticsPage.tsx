import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { StatCard } from '../../components/StatCard'
import { InlineBadge } from '../../components/InlineBadge'
import type { AuditLog } from '../../lib/types'

interface QueueItem {
  id: string
  automation_id: string
  lead_id: string | null
  job_id: string | null
  status: string
  run_at: string
  created_at: string
}

export function DiagnosticsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'logs' | 'queue'>('logs')

  useEffect(() => {
    Promise.all([
      db.query<AuditLog>('audit_logs', { order: { column: 'created_at', ascending: false }, limit: 50 }),
      db.query<QueueItem>('automation_queue', { order: { column: 'created_at', ascending: false }, limit: 50 }),
    ]).then(([l, q]) => {
      setLogs(l)
      setQueue(q)
    }).finally(() => setLoading(false))
  }, [])

  const failed = queue.filter((q) => q.status === 'failed').length
  const pending = queue.filter((q) => q.status === 'pending').length
  const completed = queue.filter((q) => q.status === 'completed').length

  const statusVariant = (s: string): 'green' | 'red' | 'amber' | 'gray' => {
    if (s === 'completed') return 'green'
    if (s === 'failed') return 'red'
    if (s === 'pending') return 'amber'
    return 'gray'
  }

  const formatTs = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <AdminPageHeader title="Diagnostics" description="Audit logs, queue status, and system activity." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Audit Events" value={loading ? '--' : logs.length} icon={<Activity size={15} />} sub="last 50" />
        <StatCard label="Queue Pending" value={loading ? '--' : pending} icon={<Clock size={15} />} color="#b45309" />
        <StatCard label="Queue Completed" value={loading ? '--' : completed} icon={<CheckCircle size={15} />} color="#15803d" />
        <StatCard label="Queue Failed" value={loading ? '--' : failed} icon={<AlertTriangle size={15} />} color={failed > 0 ? '#e11d48' : undefined} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['logs', 'queue'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: '1px solid',
              borderColor: tab === t ? '#0f62fe' : '#e5e5e5',
              background: tab === t ? '#eff6ff' : '#fff',
              color: tab === t ? '#0f62fe' : '#666',
              fontSize: 11.5,
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t === 'logs' ? 'Audit Logs' : 'Automation Queue'}
          </button>
        ))}
      </div>

      {tab === 'logs' && (
        <AdminSection title="Audit Logs" description={`${logs.length} recent events`}>
          <div>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ height: 12, borderRadius: 3, background: '#f0f0f0', width: '50%', animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
                </div>
              ))
            ) : logs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>No audit events recorded</div>
            ) : (
              logs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  style={{
                    padding: '9px 16px',
                    borderBottom: '1px solid #f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12,
                  }}
                >
                  <Activity size={12} style={{ color: '#bbb', flexShrink: 0 }} />
                  <span style={{ flex: 1, color: '#444' }}>{log.action}</span>
                  {log.entity_type && (
                    <InlineBadge variant="gray">{log.entity_type}</InlineBadge>
                  )}
                  <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>{formatTs(log.created_at)}</span>
                </motion.div>
              ))
            )}
          </div>
        </AdminSection>
      )}

      {tab === 'queue' && (
        <AdminSection title="Automation Queue" description={`${queue.length} recent items`}>
          <div>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ height: 12, borderRadius: 3, background: '#f0f0f0', width: '40%', animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
                </div>
              ))
            ) : queue.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>No queue items</div>
            ) : (
              queue.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  style={{
                    padding: '9px 16px',
                    borderBottom: '1px solid #f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12,
                  }}
                >
                  <Clock size={12} style={{ color: '#bbb', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{item.automation_id.slice(0, 8)}...</span>
                  <InlineBadge variant={statusVariant(item.status)} dot>{item.status}</InlineBadge>
                  <span style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto', flexShrink: 0 }}>{formatTs(item.created_at)}</span>
                </motion.div>
              ))
            )}
          </div>
        </AdminSection>
      )}
      <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
    </>
  )
}
