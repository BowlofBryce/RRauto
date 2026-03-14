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
import { Input, Select, Textarea } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { FilterChips } from '@/components/ui/FilterChips'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Job } from '@/lib/types'

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const serviceTypes = [
  'Lawn Mowing', 'Landscaping', 'Window Washing', 'Pressure Washing',
  'Grout Cleaning', 'Carpet Cleaning', 'House Cleaning', 'Pool Service',
  'Gutter Cleaning', 'Tree Trimming', 'Pest Control', 'HVAC Service',
  'Plumbing', 'Electrical', 'Painting', 'Other',
]

export function JobsPage() {
  const { data: jobs, loading, refresh } = useData<Job>('/jobs')
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Job | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    let result = jobs
    if (filter !== 'all') result = result.filter((j) => j.status === filter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((j) => j.service_type?.toLowerCase().includes(q) || j.notes?.toLowerCase().includes(q))
    }
    return result
  }, [jobs, filter, search])

  const columns: Column<Job>[] = [
    { key: 'service_type', label: 'Service', render: (j) => <span style={{ fontWeight: 'var(--weight-medium)' as string }}>{j.service_type}</span> },
    { key: 'status', label: 'Status', render: (j) => <StatusBadge status={j.status} /> },
    { key: 'scheduled_date', label: 'Scheduled', render: (j) => formatDate(j.scheduled_date) },
    { key: 'price', label: 'Price', render: (j) => j.price ? formatCurrency(j.price) : '--' },
    { key: 'created_at', label: 'Created', render: (j) => formatDate(j.created_at) },
  ]

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.post('/jobs', {
      contact_id: fd.get('contact_id'),
      service_type: fd.get('service_type'),
      scheduled_date: fd.get('scheduled_date') || null,
      status: 'scheduled',
      price: fd.get('price') ? Number(fd.get('price')) : null,
      notes: fd.get('notes') || null,
    })
    toast('Job created')
    setShowCreate(false)
    refresh()
  }

  const updateStatus = async (status: string) => {
    if (!selected) return
    await api.patch(`/jobs/${selected.id}`, { status })
    toast(`Job marked as ${status.replace('_', ' ')}`)
    setSelected(null)
    refresh()
  }

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this job?')) return
    await api.del(`/jobs/${selected.id}`)
    toast('Job deleted')
    setSelected(null)
    refresh()
  }

  return (
    <>
      <PageHeader
        title="Jobs"
        description={`${jobs.length} total, ${jobs.filter(j => j.status === 'scheduled').length} upcoming`}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            New job
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
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 'var(--text-sm)', color: 'var(--color-text)', flex: 1, fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <FilterChips options={statusFilters} active={filter} onChange={setFilter} />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} onRowClick={setSelected} emptyMessage="No jobs yet" />
      </div>

      <DetailPanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.service_type ?? ''}
        subtitle={selected?.scheduled_date ? `Scheduled ${formatDate(selected.scheduled_date)}` : 'No date'}
        actions={
          <>
            {selected?.status === 'scheduled' && <Button size="sm" variant="primary" onClick={() => updateStatus('in_progress')}>Start Job</Button>}
            {selected?.status === 'in_progress' && <Button size="sm" variant="primary" onClick={() => updateStatus('completed')}>Complete</Button>}
            {selected?.status !== 'cancelled' && selected?.status !== 'completed' && <Button size="sm" onClick={() => updateStatus('cancelled')}>Cancel</Button>}
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {selected && (
          <div>
            <DetailRow label="Service">{selected.service_type}</DetailRow>
            <DetailRow label="Status"><StatusBadge status={selected.status} /></DetailRow>
            <DetailRow label="Scheduled">{formatDate(selected.scheduled_date)}</DetailRow>
            <DetailRow label="Price">{selected.price ? formatCurrency(selected.price) : '--'}</DetailRow>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Job">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input name="contact_id" label="Contact ID" required />
          <Select name="service_type" label="Service Type">
            {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input name="scheduled_date" label="Scheduled Date" type="datetime-local" />
          <Input name="price" label="Price" type="number" step="0.01" />
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
