import { useState, useMemo, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { useData } from '@/hooks/useData'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DetailPanel, DetailRow } from '@/components/ui/DetailPanel'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { FilterChips } from '@/components/ui/FilterChips'
import { MetricCard } from '@/components/ui/MetricCard'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Quote } from '@/lib/types'

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
]

export function QuotesPage() {
  const { data: quotes, loading, refresh } = useData<Quote>('/quotes')
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Quote | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    let result = quotes
    if (filter !== 'all') result = result.filter((q) => q.status === filter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.notes?.toLowerCase().includes(q) || String(r.amount).includes(q))
    }
    return result
  }, [quotes, filter, search])

  const totalValue = quotes.reduce((s, q) => s + (q.amount || 0), 0)
  const acceptedValue = quotes.filter((q) => q.status === 'accepted').reduce((s, q) => s + (q.amount || 0), 0)

  const columns: Column<Quote>[] = [
    { key: 'amount', label: 'Amount', render: (q) => <span style={{ fontWeight: 'var(--weight-semibold)' as string }}>{formatCurrency(q.amount)}</span> },
    { key: 'status', label: 'Status', render: (q) => <StatusBadge status={q.status} /> },
    { key: 'sent_date', label: 'Sent', render: (q) => formatDate(q.sent_date) },
    { key: 'accepted_date', label: 'Accepted', render: (q) => formatDate(q.accepted_date) },
    { key: 'created_at', label: 'Created', render: (q) => formatDate(q.created_at) },
  ]

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.post('/quotes', {
      contact_id: fd.get('contact_id'),
      amount: Number(fd.get('amount')),
      status: 'draft',
      notes: fd.get('notes') || null,
    })
    toast('Quote created')
    setShowCreate(false)
    refresh()
  }

  const updateStatus = async (status: string, extraFields?: Record<string, string>) => {
    if (!selected) return
    await api.patch(`/quotes/${selected.id}`, { status, ...extraFields })
    toast(`Quote ${status}`)
    setSelected(null)
    refresh()
  }

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this quote?')) return
    await api.del(`/quotes/${selected.id}`)
    toast('Quote deleted')
    setSelected(null)
    refresh()
  }

  return (
    <>
      <PageHeader
        title="Quotes"
        description={`${quotes.length} total quotes`}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            New quote
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <MetricCard label="Total Quotes" value={quotes.length} />
        <MetricCard label="Total Value" value={formatCurrency(totalValue)} />
        <MetricCard label="Accepted" value={quotes.filter((q) => q.status === 'accepted').length} />
        <MetricCard label="Accepted Value" value={formatCurrency(acceptedValue)} />
      </div>

      <div style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180 }}>
            <Search size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            <input
              placeholder="Search quotes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 'var(--text-sm)', color: 'var(--color-text)', flex: 1, fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <FilterChips options={statusFilters} active={filter} onChange={setFilter} />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} onRowClick={setSelected} emptyMessage="No quotes yet" />
      </div>

      <DetailPanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? formatCurrency(selected.amount) : ''}
        subtitle={`Created ${formatDate(selected?.created_at)}`}
        actions={
          <>
            {selected?.status === 'draft' && <Button size="sm" variant="primary" onClick={() => updateStatus('sent', { sent_date: new Date().toISOString() })}>Mark Sent</Button>}
            {selected?.status === 'sent' && <Button size="sm" variant="primary" onClick={() => updateStatus('accepted', { accepted_date: new Date().toISOString() })}>Mark Accepted</Button>}
            {selected?.status === 'sent' && <Button size="sm" variant="danger" onClick={() => updateStatus('rejected')}>Mark Rejected</Button>}
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {selected && (
          <div>
            <DetailRow label="Amount"><span style={{ fontWeight: 'var(--weight-semibold)' as string }}>{formatCurrency(selected.amount)}</span></DetailRow>
            <DetailRow label="Status"><StatusBadge status={selected.status} /></DetailRow>
            <DetailRow label="Sent Date">{formatDate(selected.sent_date)}</DetailRow>
            <DetailRow label="Accepted Date">{formatDate(selected.accepted_date)}</DetailRow>
            <DetailRow label="Contact ID">{selected.contact_id}</DetailRow>
            {selected.notes && (
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' as string, color: 'var(--color-text-secondary)' }}>Notes</span>
                <p style={{ marginTop: 6, fontSize: 'var(--text-sm)', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailPanel>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Quote">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input name="contact_id" label="Contact ID" required />
          <Input name="amount" label="Amount" type="number" step="0.01" required />
          <Textarea name="notes" label="Notes" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
