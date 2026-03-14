import { useState, useMemo, type FormEvent } from 'react'
import { Plus, Search, Mail, Phone, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { useData } from '@/hooks/useData'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DetailPanel, DetailRow } from '@/components/ui/DetailPanel'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Contact } from '@/lib/types'

export function ContactsPage() {
  const { data: contacts, loading, refresh } = useData<Contact>('/contacts')
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return contacts
    const q = search.toLowerCase()
    return contacts.filter((c) =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    )
  }, [contacts, search])

  const columns: Column<Contact>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '30%',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={c.name || '?'} size={28} />
          <div>
            <div style={{ fontWeight: 'var(--weight-medium)' as string }}>{c.name}</div>
            {c.email && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{c.email}</div>}
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (c) => c.phone || '--' },
    { key: 'address', label: 'Address', render: (c) => c.address || '--' },
    {
      key: 'tags',
      label: 'Tags',
      render: (c) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {c.tags?.map((t) => <Badge key={t}>{t}</Badge>)}
        </div>
      ),
    },
    { key: 'created_at', label: 'Created', render: (c) => formatDate(c.created_at) },
  ]

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const tagsStr = fd.get('tags') as string
    const payload = {
      name: fd.get('name'),
      email: fd.get('email') || null,
      phone: fd.get('phone') || null,
      address: fd.get('address') || null,
      tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notes: fd.get('notes') || null,
    }
    await api.post('/contacts', payload)
    toast('Contact created')
    setShowCreate(false)
    refresh()
  }

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selected) return
    const fd = new FormData(e.currentTarget)
    const tagsStr = fd.get('tags') as string
    const payload = {
      name: fd.get('name'),
      email: fd.get('email') || null,
      phone: fd.get('phone') || null,
      address: fd.get('address') || null,
      tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notes: fd.get('notes') || null,
    }
    await api.patch(`/contacts/${selected.id}`, payload)
    toast('Contact updated')
    setShowEdit(false)
    setSelected(null)
    refresh()
  }

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this contact?')) return
    await api.del(`/contacts/${selected.id}`)
    toast('Contact deleted')
    setSelected(null)
    refresh()
  }

  return (
    <>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} total contacts`}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            Add contact
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
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={14} style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text)',
              flex: 1,
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} onRowClick={setSelected} emptyMessage="No contacts yet. Add your first contact to get started." />
      </div>

      <DetailPanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        subtitle={selected?.email ?? undefined}
        actions={
          <>
            <Button size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {selected.phone && (
              <DetailRow label="Phone">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {selected.phone}</span>
              </DetailRow>
            )}
            {selected.email && (
              <DetailRow label="Email">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {selected.email}</span>
              </DetailRow>
            )}
            {selected.address && (
              <DetailRow label="Address">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {selected.address}</span>
              </DetailRow>
            )}
            <DetailRow label="Tags">
              {selected.tags?.length ? (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {selected.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                </div>
              ) : '--'}
            </DetailRow>
            <DetailRow label="Created">{formatDate(selected.created_at)}</DetailRow>
            {selected.notes && (
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' as string, color: 'var(--color-text-secondary)' }}>Notes</span>
                <p style={{ marginTop: 6, fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailPanel>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Contact">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input name="name" label="Name" required />
          <Input name="email" label="Email" type="email" />
          <Input name="phone" label="Phone" />
          <Input name="address" label="Address" />
          <Input name="tags" label="Tags" placeholder="residential, vip (comma separated)" />
          <Textarea name="notes" label="Notes" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Contact">
        {selected && (
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input name="name" label="Name" required defaultValue={selected.name} />
            <Input name="email" label="Email" type="email" defaultValue={selected.email ?? ''} />
            <Input name="phone" label="Phone" defaultValue={selected.phone ?? ''} />
            <Input name="address" label="Address" defaultValue={selected.address ?? ''} />
            <Input name="tags" label="Tags" defaultValue={selected.tags?.join(', ') ?? ''} />
            <Textarea name="notes" label="Notes" defaultValue={selected.notes ?? ''} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Button type="button" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
