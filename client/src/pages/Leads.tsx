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
import { Input, Select } from '@/components/ui/Input'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { FilterChips } from '@/components/ui/FilterChips'
import { formatDate } from '@/lib/utils'
import type { Lead } from '@/lib/types'

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
]

export function LeadsPage() {
  const { data: leads, loading, refresh } = useData<Lead>('/leads')
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    let result = leads
    if (filter !== 'all') result = result.filter((l) => l.status === filter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((l) => l.source?.toLowerCase().includes(q) || l.assigned_to?.toLowerCase().includes(q))
    }
    return result
  }, [leads, filter, search])

  const columns: Column<Lead>[] = [
    { key: 'source', label: 'Source', render: (l) => <Badge>{l.source || 'Unknown'}</Badge> },
    { key: 'status', label: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    { key: 'pipeline_stage', label: 'Stage', render: (l) => l.pipeline_stage || '--' },
    { key: 'assigned_to', label: 'Assigned', render: (l) => l.assigned_to || '--' },
    { key: 'created_at', label: 'Created', render: (l) => formatDate(l.created_at) },
  ]

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.post('/leads', {
      contact_id: fd.get('contact_id'),
      source: fd.get('source'),
      status: fd.get('status') || 'new',
      pipeline_stage: fd.get('pipeline_stage') || null,
      assigned_to: fd.get('assigned_to') || null,
    })
    toast('Lead created')
    setShowCreate(false)
    refresh()
  }

  const updateStatus = async (status: string) => {
    if (!selected) return
    await api.patch(`/leads/${selected.id}`, { status })
    toast(`Lead marked as ${status}`)
    setSelected(null)
    refresh()
  }

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this lead?')) return
    await api.del(`/leads/${selected.id}`)
    toast('Lead deleted')
    setSelected(null)
    refresh()
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${leads.length} total, ${leads.filter(l => l.status === 'new').length} new`}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            Add lead
          </Button>
        }
      />

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
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 'var(--text-sm)', color: 'var(--color-text)', flex: 1, fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <FilterChips options={statusFilters} active={filter} onChange={setFilter} />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} onRowClick={setSelected} emptyMessage="No leads found" />
      </div>

      <DetailPanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Lead from ${selected?.source || 'Unknown'}`}
        subtitle={`Created ${formatDate(selected?.created_at)}`}
        actions={
          <>
            {selected?.status !== 'won' && <Button size="sm" variant="primary" onClick={() => updateStatus('won')}>Mark Won</Button>}
            {selected?.status !== 'lost' && <Button size="sm" variant="danger" onClick={() => updateStatus('lost')}>Mark Lost</Button>}
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {selected && (
          <div>
            <DetailRow label="Status"><StatusBadge status={selected.status} /></DetailRow>
            <DetailRow label="Source"><Badge>{selected.source}</Badge></DetailRow>
            <DetailRow label="Pipeline Stage">{selected.pipeline_stage || '--'}</DetailRow>
            <DetailRow label="Assigned To">{selected.assigned_to || '--'}</DetailRow>
            <DetailRow label="Contact ID">{selected.contact_id}</DetailRow>
            <DetailRow label="Created">{formatDate(selected.created_at)}</DetailRow>
          </div>
        )}
      </DetailPanel>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Lead">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input name="contact_id" label="Contact ID" required />
          <Select name="source" label="Source">
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="google_ads">Google Ads</option>
            <option value="facebook">Facebook</option>
            <option value="phone">Phone Call</option>
            <option value="walk_in">Walk-in</option>
          </Select>
          <Select name="status" label="Status">
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
          </Select>
          <Input name="pipeline_stage" label="Pipeline Stage" />
          <Input name="assigned_to" label="Assigned To" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
