import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Phone, Mail, Tag, Trash2 } from 'lucide-react'
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
  exit: { opacity: 0, x: -8, transition: { duration: 0.14 } },
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
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Contacts"
        description={`${contacts.length} total`}
        actions={
          <>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-4 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="input-base h-8 pl-8 pr-3 text-[13px] rounded-lg w-44"
              />
            </div>
            <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
              <Plus size={14} /> New Contact
            </Button>
          </>
        }
      />

      <div className="bg-raised border border-app rounded-xl overflow-hidden">
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
          <motion.ul layout className="divide-y divide-app">
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
                  className="flex items-center gap-4 px-5 py-3.5 row-hover transition-colors group"
                >
                  <Avatar name={c.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-1">{c.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {c.phone && (
                        <span className="flex items-center gap-1 text-xs text-3">
                          <Phone size={10} />{c.phone}
                        </span>
                      )}
                      {c.email && (
                        <span className="flex items-center gap-1 text-xs text-3">
                          <Mail size={10} />{c.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {c.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="neutral">
                        <Tag size={8} />{tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-4 hidden lg:block w-16 text-right flex-shrink-0">
                    {formatRelative(c.created_at)}
                  </span>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-4 hover:text-red hover:bg-red-subtle transition-all duration-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Contact">
        <div className="space-y-3">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Optional notes..."
              className="input-base px-3 py-2 rounded-md text-sm resize-none focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>Create Contact</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
