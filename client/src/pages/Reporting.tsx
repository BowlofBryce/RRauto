import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Target, FileText, Briefcase, MessageSquare, Zap } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { MetricCard } from '@/components/ui/MetricCard'
import { formatCurrency } from '@/lib/utils'
import type { Contact, Lead, Quote, Job, Communication, Automation } from '@/lib/types'

interface Stats {
  contacts: Contact[]
  leads: Lead[]
  quotes: Quote[]
  jobs: Job[]
  communications: Communication[]
  automations: Automation[]
}

function BarSection({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 'var(--text-sm)' }}>
      <span style={{ width: 100, color: 'var(--color-text-secondary)', flexShrink: 0, textTransform: 'capitalize' }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'var(--color-bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 4 }}
        />
      </div>
      <span style={{ width: 32, textAlign: 'right', fontWeight: 'var(--weight-medium)' as string, color: 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

export function ReportingPage() {
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Contact[]>('/contacts'),
      api.get<Lead[]>('/leads'),
      api.get<Quote[]>('/quotes'),
      api.get<Job[]>('/jobs'),
      api.get<Communication[]>('/communications'),
      api.get<Automation[]>('/automations'),
    ]).then(([contacts, leads, quotes, jobs, communications, automations]) => {
      setData({ contacts, leads, quotes, jobs, communications, automations })
    }).finally(() => setLoading(false))
  }, [])

  const leadsBySource = useMemo(() => {
    if (!data) return []
    const map: Record<string, number> = {}
    data.leads.forEach((l) => { map[l.source] = (map[l.source] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [data])

  const leadsByStatus = useMemo(() => {
    if (!data) return []
    const map: Record<string, number> = {}
    data.leads.forEach((l) => { map[l.status] = (map[l.status] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [data])

  const jobsByStatus = useMemo(() => {
    if (!data) return []
    const map: Record<string, number> = {}
    data.jobs.forEach((j) => { map[j.status] = (map[j.status] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [data])

  if (loading || !data) {
    return (
      <>
        <PageHeader title="Reporting" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 88, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      </>
    )
  }

  const revenue = data.quotes.filter(q => q.status === 'accepted').reduce((s, q) => s + (q.amount || 0), 0)
  const quoteConversion = data.quotes.length > 0 ? Math.round((data.quotes.filter(q => q.status === 'accepted').length / data.quotes.length) * 100) : 0
  const leadConversion = data.leads.length > 0 ? Math.round((data.leads.filter(l => l.status === 'won').length / data.leads.length) * 100) : 0

  const maxSource = Math.max(...leadsBySource.map(([, v]) => v), 1)
  const maxLeadStatus = Math.max(...leadsByStatus.map(([, v]) => v), 1)
  const maxJobStatus = Math.max(...jobsByStatus.map(([, v]) => v), 1)

  return (
    <>
      <PageHeader title="Reporting" description="Business performance overview." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <MetricCard label="Contacts" value={data.contacts.length} icon={<Users size={16} />} />
        <MetricCard label="Leads" value={data.leads.length} icon={<Target size={16} />} trend={`${leadConversion}% conversion`} trendUp={leadConversion > 0} />
        <MetricCard label="Revenue" value={formatCurrency(revenue)} icon={<TrendingUp size={16} />} />
        <MetricCard label="Quote Conversion" value={`${quoteConversion}%`} icon={<FileText size={16} />} trendUp={quoteConversion > 30} />
        <MetricCard label="Jobs" value={data.jobs.length} icon={<Briefcase size={16} />} trend={`${data.jobs.filter(j => j.status === 'completed').length} completed`} />
        <MetricCard label="Messages" value={data.communications.length} icon={<MessageSquare size={16} />} />
        <MetricCard label="Active Automations" value={data.automations.filter(a => a.is_active).length} icon={<Zap size={16} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
          }}
        >
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string, marginBottom: 16 }}>Lead Sources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leadsBySource.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>No lead data yet</p>
            ) : (
              leadsBySource.map(([source, count]) => (
                <BarSection key={source} label={source} value={count} max={maxSource} color="var(--color-primary)" />
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
          }}
        >
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string, marginBottom: 16 }}>Lead Status Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leadsByStatus.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>No lead data yet</p>
            ) : (
              leadsByStatus.map(([status, count]) => (
                <BarSection key={status} label={status} value={count} max={maxLeadStatus} color={status === 'won' ? 'var(--color-success)' : status === 'lost' ? 'var(--color-error)' : 'var(--color-info)'} />
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            gridColumn: '1 / -1',
          }}
        >
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string, marginBottom: 16 }}>Job Status Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobsByStatus.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>No job data yet</p>
            ) : (
              jobsByStatus.map(([status, count]) => (
                <BarSection
                  key={status}
                  label={status.replace('_', ' ')}
                  value={count}
                  max={maxJobStatus}
                  color={status === 'completed' ? 'var(--color-success)' : status === 'cancelled' ? 'var(--color-error)' : status === 'in_progress' ? 'var(--color-warning)' : 'var(--color-primary)'}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
