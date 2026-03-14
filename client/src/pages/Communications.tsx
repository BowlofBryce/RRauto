import { useState, useMemo, type FormEvent } from 'react'
import { Plus, Search, Mail, MessageCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useData } from '@/hooks/useData'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { DetailPanel, DetailRow } from '@/components/ui/DetailPanel'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import type { Communication } from '@/lib/types'

const typeFilters = [
  { label: 'All', value: 'all' },
  { label: 'SMS', value: 'sms' },
  { label: 'Email', value: 'email' },
  { label: 'Sent', value: 'sent' },
  { label: 'Received', value: 'received' },
]

export function CommunicationsPage() {
  const { data: comms, loading, refresh } = useData<Communication>('/communications')
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Communication | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    let result = comms
    if (filter === 'sms' || filter === 'email') result = result.filter((c) => c.type === filter)
    if (filter === 'sent' || filter === 'received') result = result.filter((c) => c.direction === filter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.message?.toLowerCase().includes(q))
    }
    return result
  }, [comms, filter, search])

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.post('/communications', {
      contact_id: fd.get('contact_id'),
      type: fd.get('type'),
      direction: fd.get('direction'),
      message: fd.get('message'),
      sent_at: new Date().toISOString(),
    })
    toast('Message logged')
    setShowCreate(false)
    refresh()
  }

  return (
    <>
      <PageHeader
        title="Messages"
        description={`${comms.length} messages`}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            Log message
          </Button>
        }
      />

      <div style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180 }}>
            <Search size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            <input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 'var(--text-sm)', color: 'var(--color-text)', flex: 1, fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <FilterChips options={typeFilters} active={filter} onChange={setFilter} />
        </div>

        {loading ? (
          <div style={{ padding: 32 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 48, background: 'var(--color-bg-subtle)', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={32} />}
            title="No messages"
            description="Communication history will appear here as you interact with contacts."
          />
        ) : (
          <div>
            {filtered.map((comm, i) => (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelected(comm)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  borderBottom: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  transition: 'background 100ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: comm.type === 'sms' ? 'var(--color-success-subtle)' : 'var(--color-primary-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {comm.type === 'sms' ? (
                    <MessageCircle size={13} style={{ color: 'var(--color-success-text)' }} />
                  ) : (
                    <Mail size={13} style={{ color: 'var(--color-primary-text)' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Badge variant={comm.type === 'sms' ? 'success' : 'primary'}>{comm.type.toUpperCase()}</Badge>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {comm.direction === 'sent' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                      {comm.direction}
                    </span>
                    {comm.automation_id && <Badge variant="info">Automated</Badge>}
                  </div>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}>
                    {comm.message}
                  </p>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {formatDate(comm.sent_at)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DetailPanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.type.toUpperCase()} -- ${selected.direction}` : ''}
        subtitle={formatDate(selected?.sent_at)}
      >
        {selected && (
          <div>
            <DetailRow label="Type"><Badge variant={selected.type === 'sms' ? 'success' : 'primary'}>{selected.type.toUpperCase()}</Badge></DetailRow>
            <DetailRow label="Direction">{selected.direction}</DetailRow>
            <DetailRow label="Contact ID">{selected.contact_id}</DetailRow>
            <DetailRow label="Sent At">{formatDate(selected.sent_at)}</DetailRow>
            {selected.automation_id && <DetailRow label="Automation">Automated</DetailRow>}
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' as string, color: 'var(--color-text-secondary)' }}>Message</span>
              <div style={{
                marginTop: 8,
                padding: 14,
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {selected.message}
              </div>
            </div>
          </div>
        )}
      </DetailPanel>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Log Message">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input name="contact_id" label="Contact ID" required />
          <Select name="type" label="Type">
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </Select>
          <Select name="direction" label="Direction">
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </Select>
          <Textarea name="message" label="Message" required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Log</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
