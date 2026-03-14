import { useState } from 'react'
import { motion } from 'motion/react'
import { Building2, Smartphone, Globe, Copy, Check, Sun, Moon } from 'lucide-react'
import { useBusiness } from '../context/BusinessContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type { Business } from '../types/crm.types'
import type { ReactNode, ElementType } from 'react'

export function Settings() {
  const { business, setBusiness } = useBusiness()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const settings = (business?.settings ?? {}) as Record<string, string>

  const [form, setForm] = useState({
    name: business?.name ?? '',
    industry: business?.industry ?? '',
    phone: settings.phone ?? '',
    email: settings.email ?? '',
    review_link: settings.review_link ?? '',
  })

  const handleSave = async () => {
    if (!business) return
    setSaving(true)
    const { data } = await supabase
      .from('businesses')
      .update({
        name: form.name,
        industry: form.industry,
        settings: { ...settings, phone: form.phone, email: form.email, review_link: form.review_link },
      })
      .eq('id', business.id)
      .select()
      .single()
    if (data) setBusiness(data as Business)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const copyId = () => {
    if (!business) return
    navigator.clipboard.writeText(business.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Settings" description="Configure your business profile" />
      <div className="space-y-4">
        <Section title="Business Info" icon={Building2}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Business Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-2">Industry</label>
              <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="input-base h-8 px-3 rounded-lg text-[13px] focus:outline-none">
                <option value="landscaping">Landscaping</option>
                <option value="window_washing">Window Washing</option>
                <option value="pressure_washing">Pressure Washing</option>
                <option value="grout_cleaning">Grout Cleaning</option>
                <option value="home_services">Home Services</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Contact Channels" icon={Smartphone}>
          <div className="space-y-3">
            <Input label="Business Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+15551234567" />
            <Input label="Business Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hello@yourbusiness.com" />
          </div>
        </Section>

        <Section title="Review Link" icon={Globe}>
          <Input label="Google Review Link" value={form.review_link} onChange={(e) => setForm({ ...form, review_link: e.target.value })} placeholder="https://g.page/r/..." />
        </Section>

        <Section title="Appearance" icon={Sun}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-1">Theme</p>
              <p className="text-[12px] text-3 mt-0.5">Switch between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </Section>

        <Section title="System" icon={Copy}>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-subtle rounded-lg px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-3 uppercase tracking-wide mb-0.5">Business ID</p>
                <p className="text-xs font-mono text-2 truncate">{business?.id}</p>
              </div>
              <button onClick={copyId} className="flex items-center gap-1 text-xs text-3 hover:text-1 transition-colors flex-shrink-0">
                {copied ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-3 bg-subtle rounded-lg px-3 py-2.5">
              <div>
                <p className="text-[10px] font-medium text-3 uppercase tracking-wide mb-0.5">Slug</p>
                <p className="text-xs font-mono text-2">{business?.slug}</p>
              </div>
            </div>
          </div>
        </Section>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            {saved ? <><Check size={13} />Saved</> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-raised border border-app rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-app">
        <Icon size={14} className="text-3" />
        <h3 className="text-sm font-semibold text-1">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center h-8 w-[72px] rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: theme === 'dark' ? 'var(--brand)' : 'var(--muted)' }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="absolute flex items-center justify-center h-6 w-6 rounded-full shadow-app-sm"
        style={{
          left: theme === 'dark' ? 'calc(100% - 28px)' : '4px',
          backgroundColor: 'var(--raised)',
        }}
      >
        {theme === 'dark'
          ? <Moon size={12} style={{ color: 'var(--brand)' }} />
          : <Sun size={12} style={{ color: 'var(--fg-3)' }} />
        }
      </motion.div>
    </button>
  )
}
