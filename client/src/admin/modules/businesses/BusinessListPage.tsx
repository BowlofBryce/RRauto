import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useAdminData } from '../../hooks/use-admin-data'
import { AdminPageHeader } from '../../components/AdminPageHeader'
import { AdminTable, type AdminColumn } from '../../components/AdminTable'
import { InlineBadge } from '../../components/InlineBadge'
import { Button } from '@/components/ui/Button'
import type { Business } from '../../lib/types'

const planColors: Record<string, 'gray' | 'blue' | 'green'> = { essential: 'gray', growth: 'blue', pro: 'green' }
const statusColors: Record<string, 'green' | 'amber' | 'red' | 'gray'> = { active: 'green', onboarding: 'amber', suspended: 'red', archived: 'gray' }

export function BusinessListPage() {
  const { data, loading } = useAdminData<Business>('businesses', { order: { column: 'created_at', ascending: false } })
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((b) => b.name?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q))
  }, [data, search])

  const columns: AdminColumn<Business>[] = [
    { key: 'name', label: 'Business', width: '30%', render: (b) => <span style={{ fontWeight: 500, color: '#111' }}>{b.name}</span> },
    { key: 'slug', label: 'Slug', render: (b) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888' }}>{b.slug}</span> },
    { key: 'plan', label: 'Plan', render: (b) => <InlineBadge variant={planColors[b.plan] ?? 'gray'}>{b.plan}</InlineBadge> },
    { key: 'status', label: 'Status', render: (b) => <InlineBadge variant={statusColors[b.status] ?? 'gray'} dot>{b.status}</InlineBadge> },
    { key: 'timezone', label: 'Timezone', render: (b) => <span style={{ color: '#888' }}>{b.timezone}</span> },
    {
      key: 'created_at', label: 'Created',
      render: (b) => <span style={{ color: '#999', fontSize: 11.5 }}>{new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>,
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Businesses"
        description={`${data.length} registered businesses`}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => navigate('/admin/businesses/new')}>
            New Business
          </Button>
        }
      />

      <div style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={13} style={{ color: '#aaa' }} />
          <input
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#333', flex: 1, fontFamily: 'var(--font-sans)' }}
          />
        </div>
        <AdminTable columns={columns} data={filtered} loading={loading} onRowClick={(b) => navigate(`/admin/businesses/${b.id}`)} />
      </div>
    </>
  )
}
