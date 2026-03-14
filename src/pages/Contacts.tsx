import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Phone, Mail, Trash2 } from 'lucide-react'
import { useBusiness } from '../context/BusinessContext'
import { getContacts, createContact, deleteContact, searchContacts } from '../modules/contacts/contacts.service'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatRelative } from '../lib/utils'
import type { Contact } from '../types/crm.types'

const rowV = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, type: 'spring' as const, stiffness: 300, damping: 28 },
  }),
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

export function Contacts() {
  const { business } = useBusiness()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' })

  const load = async () => {
    if (!business) return
    setLoading(true)
    const data = search ? await searchContacts(business.id, search) : await getContacts(business.id)
    setContacts(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [business, search])

  const handleCreate = async () => {
    if (!business || !form.name.trim()) return
    setSaving(true)
    await createContact({ ...form, business_id: business.id })
    setSaving(false)
    setAddOpen(false)
    setForm({ name: '', phone: '', email: '', address: '', notes: '' })
    load()
  }

  const handleDelete = async (id: string) => {
    setContacts((p) => p.filter((c) => c.id !== id))
    await deleteContact(id)
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} people`}
        actions={
          <>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-4 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="input-base h-8 pl-8 pr-3 text-[13px] rounded-lg w-40"
              />
            </div>
            <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
              <Plus size={13} /> New Contact
            </Button>
          </>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={Search}
            title={search ? 'No results' : 'No contacts yet'}
            description={search ? `No contacts match "${search}"` : 'Add your first contact to get started'}
            action={!search ? { label: 'Add Contact', onClick: () => setAddOpen(true) } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-[1fr_180px_180px_80px_32px] gap-4 px-5 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="text-[11px] font-semibold text-4 uppercase tracking-wider">Name</div>
              <div className="text-[11px] font-semibold text-4 uppercase tracking-wider">Phone</div>
              <div className="text-[11px] font-semibold text-4 uppercase tracking-wider">Email</div>
              <div className="text-[11px] font-semibold text-4 uppercase tracking-wider">Added</div>
              <div />
            </div>
            <motion.ul layout className="divide-app">
              <AnimatePresence initial={false}>
                {contacts.map((c, i) => (
                  <motion.li
                    key={c.id}
                    custom={i}
                    variants={rowV}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="grid grid-cols-[1fr_180px_180px_80px_32px] gap-4 items-center px-5 py-3 row-hover transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={c.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-1 truncate">{c.name}</p>
                        {c.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {c.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="neutral" className="text-[10px] px-1">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[13px] text-3 truncate">
                      {c.phone ? <span className="flex items-center gap-1"><Phone size={10} className="flex-shrink-0" />{c.phone}</span> : <span className="text-4">—</span>}
                    </span>
                    <span className="text-[13px] text-3 truncate">
                      {c.email ? <span className="flex items-center gap-1"><Mail size={10} className="flex-shrink-0" />{c.email}</span> : <span className="text-4">—</span>}
                    </span>
                    <span className="text-[12px] text-4">{formatRelative(c.created_at)}</span>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md flex items-center justify-center text-4 hover:text-red hover:bg-red-subtle transition-all duration-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Contact">
        <div className="space-y-3">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-3">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Optional notes..."
              className="input-base px-3 py-2 rounded-lg text-[13px] resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>Create Contact</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
