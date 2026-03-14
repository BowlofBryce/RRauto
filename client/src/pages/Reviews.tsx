import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageCircle, Zap, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { MetricCard } from '@/components/ui/MetricCard'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import type { Communication, Automation, Job } from '@/lib/types'

export function ReviewsPage() {
  const [comms, setComms] = useState<Communication[]>([])
  const [automations, setAutomations] = useState<Automation[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Communication[]>('/communications'),
      api.get<Automation[]>('/automations'),
      api.get<Job[]>('/jobs'),
    ]).then(([c, a, j]) => {
      setComms(c)
      setAutomations(a)
      setJobs(j)
    }).finally(() => setLoading(false))
  }, [])

  const reviewAutomation = automations.find((a) => a.trigger === 'job_completed')
  const completedJobs = jobs.filter((j) => j.status === 'completed')
  const reviewMessages = useMemo(() =>
    comms.filter((c) => c.automation_id && c.direction === 'sent'),
    [comms]
  )

  return (
    <>
      <PageHeader title="Reviews" description="Track review requests and customer follow-up activity." />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 88, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            <MetricCard label="Completed Jobs" value={completedJobs.length} icon={<Star size={16} />} />
            <MetricCard label="Review Requests Sent" value={reviewMessages.length} icon={<Send size={16} />} />
            <MetricCard
              label="Review Automation"
              value={reviewAutomation?.is_active ? 'Active' : 'Inactive'}
              icon={<Zap size={16} />}
            />
          </div>

          {reviewAutomation && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Zap size={14} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string }}>{reviewAutomation.name}</span>
                <Badge variant={reviewAutomation.is_active ? 'success' : 'default'} dot>
                  {reviewAutomation.is_active ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                This automation sends a review request to customers after a job is completed.
                {reviewAutomation.steps?.[0]?.delay_minutes ? ` It waits ${reviewAutomation.steps[0].delay_minutes >= 60 ? `${Math.round(reviewAutomation.steps[0].delay_minutes / 60)} hours` : `${reviewAutomation.steps[0].delay_minutes} minutes`} before sending.` : ''}
              </p>
            </motion.div>
          )}

          <div style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string }}>Automated Follow-up Messages</span>
            </div>
            {reviewMessages.length === 0 ? (
              <EmptyState
                icon={<MessageCircle size={28} />}
                title="No automated messages yet"
                description="Once automations send review requests or follow-ups, they will appear here."
              />
            ) : (
              reviewMessages.slice(0, 20).map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <Send size={13} style={{ color: 'var(--color-primary)', marginTop: 3, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</p>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {msg.type.toUpperCase()} -- {formatDate(msg.sent_at)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </>
  )
}
