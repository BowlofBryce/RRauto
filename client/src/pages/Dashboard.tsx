import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Target, Briefcase, FileText, Zap, ArrowUpRight, MessageSquare, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { MetricCard } from '@/components/ui/MetricCard'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Contact, Lead, Job, Quote, Communication, Automation } from '@/lib/types'

interface DashboardData {
  contacts: Contact[]
  leads: Lead[]
  jobs: Job[]
  quotes: Quote[]
  communications: Communication[]
  automations: Automation[]
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Contact[]>('/contacts'),
      api.get<Lead[]>('/leads'),
      api.get<Job[]>('/jobs'),
      api.get<Quote[]>('/quotes'),
      api.get<Communication[]>('/communications'),
      api.get<Automation[]>('/automations'),
    ]).then(([contacts, leads, jobs, quotes, communications, automations]) => {
      setData({ contacts, leads, jobs, quotes, communications, automations })
    }).finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ height: 24, width: 160, background: 'var(--color-bg-muted)', borderRadius: 6, marginBottom: 6 }} />
          <div style={{ height: 16, width: 240, background: 'var(--color-bg-subtle)', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 88, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    )
  }

  const openLeads = data.leads.filter((l) => l.status === 'new' || l.status === 'contacted')
  const upcomingJobs = data.jobs.filter((j) => j.status === 'scheduled')
  const acceptedQuotes = data.quotes.filter((q) => q.status === 'accepted')
  const revenue = acceptedQuotes.reduce((sum, q) => sum + (q.amount || 0), 0)
  const activeAutomations = data.automations.filter((a) => a.is_active)
  const recentComms = data.communications.slice(0, 5)
  const recentJobs = data.jobs.slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.02em' }}>Overview</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
          Here is what is happening across your business today.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        <MetricCard label="Total Contacts" value={data.contacts.length} icon={<Users size={16} />} />
        <MetricCard label="Open Leads" value={openLeads.length} icon={<Target size={16} />} trend={`${data.leads.filter(l => l.status === 'won').length} won`} trendUp />
        <MetricCard label="Upcoming Jobs" value={upcomingJobs.length} icon={<Briefcase size={16} />} />
        <MetricCard label="Revenue" value={formatCurrency(revenue)} icon={<TrendingUp size={16} />} trend={`${acceptedQuotes.length} quotes`} trendUp />
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
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Recent Jobs</span>
            <Link to="/jobs" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div>
            {recentJobs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                No jobs yet
              </div>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontWeight: 'var(--weight-medium)' as string }}>{job.service_type}</span>
                    <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                      {job.scheduled_date ? formatDate(job.scheduled_date) : 'No date'}
                      {job.price ? ` -- ${formatCurrency(job.price)}` : ''}
                    </span>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
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
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Recent Messages</span>
            <Link to="/communications" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div>
            {recentComms.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                No messages yet
              </div>
            ) : (
              recentComms.map((comm) => (
                <div
                  key={comm.id}
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderBottom: '1px solid var(--color-border-subtle)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <MessageSquare size={14} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>
                      {comm.message}
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {comm.type.toUpperCase()} {comm.direction} -- {formatDate(comm.sent_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
      >
        <QuickLink to="/leads" icon={<Target size={16} />} label="Manage Leads" count={openLeads.length} hint="open" />
        <QuickLink to="/automations" icon={<Zap size={16} />} label="Automations" count={activeAutomations.length} hint="active" />
        <QuickLink to="/quotes" icon={<FileText size={16} />} label="Quotes" count={data.quotes.filter(q => q.status === 'sent').length} hint="pending" />
      </motion.div>
    </div>
  )
}

function QuickLink({ to, icon, label, count, hint }: { to: string; icon: React.ReactNode; label: string; count: number; hint: string }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transition: 'all 120ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
      >
        <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' as string, color: 'var(--color-text)' }}>{label}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{count} {hint}</div>
        </div>
        <ArrowUpRight size={14} style={{ marginLeft: 'auto', color: 'var(--color-text-tertiary)' }} />
      </div>
    </Link>
  )
}
