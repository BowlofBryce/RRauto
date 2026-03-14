import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Mail, Smartphone, Globe } from 'lucide-react'
import { db } from '../../lib/admin-api'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminSection } from '../../components/AdminCard'
import { StatCard } from '../../components/StatCard'
import { InlineBadge } from '../../components/InlineBadge'
import type { MessagingTemplate } from '../../lib/types'

export function MessagingPage() {
  const [templates, setTemplates] = useState<MessagingTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    db.query<MessagingTemplate>('messaging_templates', { order: { column: 'name', ascending: true } })
      .then(setTemplates)
      .finally(() => setLoading(false))
  }, [])

  const defaults = templates.filter((t) => t.is_default)
  const custom = templates.filter((t) => !t.is_default)
  const smsCount = templates.filter((t) => t.channel === 'sms').length
  const emailCount = templates.filter((t) => t.channel === 'email').length

  const channelIcon = (ch: string) => {
    if (ch === 'sms') return <Smartphone size={12} />
    if (ch === 'email') return <Mail size={12} />
    return <Globe size={12} />
  }

  const channelVariant = (ch: string): 'blue' | 'green' | 'gray' => {
    if (ch === 'sms') return 'green'
    if (ch === 'email') return 'blue'
    return 'gray'
  }

  return (
    <>
      <AdminPageHeader title="Messaging" description="Manage message templates for automations and communications." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Templates" value={loading ? '--' : templates.length} icon={<MessageSquare size={15} />} />
        <StatCard label="SMS" value={loading ? '--' : smsCount} icon={<Smartphone size={15} />} color="#15803d" />
        <StatCard label="Email" value={loading ? '--' : emailCount} icon={<Mail size={15} />} color="#0f62fe" />
        <StatCard label="Default" value={loading ? '--' : defaults.length} icon={<Globe size={15} />} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TemplateSection
          title="Default Templates"
          description="Platform-wide templates applied to all new businesses"
          templates={defaults}
          loading={loading}
          expanded={expanded}
          setExpanded={setExpanded}
          channelIcon={channelIcon}
          channelVariant={channelVariant}
        />
        {custom.length > 0 && (
          <TemplateSection
            title="Custom Templates"
            description="Business-specific templates"
            templates={custom}
            loading={loading}
            expanded={expanded}
            setExpanded={setExpanded}
            channelIcon={channelIcon}
            channelVariant={channelVariant}
          />
        )}
      </div>
    </>
  )
}

function TemplateSection({ title, description, templates, loading, expanded, setExpanded, channelIcon, channelVariant }: {
  title: string
  description: string
  templates: MessagingTemplate[]
  loading: boolean
  expanded: string | null
  setExpanded: (id: string | null) => void
  channelIcon: (ch: string) => React.ReactNode
  channelVariant: (ch: string) => 'blue' | 'green' | 'gray'
}) {
  return (
    <AdminSection title={title} description={description}>
      <div>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ height: 12, borderRadius: 3, background: '#f0f0f0', width: '45%', animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
              <style>{`@keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
            </div>
          ))
        ) : templates.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>No templates</div>
        ) : (
          templates.map((tmpl, i) => (
            <div key={tmpl.id}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setExpanded(expanded === tmpl.id ? null : tmpl.id)}
                style={{
                  padding: '11px 16px',
                  borderBottom: expanded === tmpl.id ? 'none' : '1px solid #f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: 12,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <MessageSquare size={13} style={{ color: '#888', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: '#222' }}>{tmpl.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>trigger: {tmpl.trigger}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <InlineBadge variant={channelVariant(tmpl.channel)}>
                    {channelIcon(tmpl.channel)} {tmpl.channel}
                  </InlineBadge>
                </div>
              </motion.div>

              {expanded === tmpl.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', overflow: 'hidden', padding: '12px 16px 12px 42px' }}
                >
                  {tmpl.subject && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Subject</div>
                      <div style={{ fontSize: 12, color: '#333' }}>{tmpl.subject}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Body</div>
                    <div style={{
                      fontSize: 12,
                      color: '#444',
                      lineHeight: 1.5,
                      background: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 6,
                      padding: '10px 12px',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                    }}>
                      {tmpl.body}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminSection>
  )
}
