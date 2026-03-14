import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Building2, Puzzle, Flag, Zap, Package, MessageSquare, FolderInput as FormInput, Shield, Activity, CreditCard, Settings2, ChevronLeft, ChevronRight, LogOut, Hexagon } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const sections = [
  {
    label: null,
    items: [
      { path: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Platform',
    items: [
      { path: '/admin/businesses', label: 'Businesses', icon: Building2 },
      { path: '/admin/modules', label: 'Modules', icon: Puzzle },
      { path: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { path: '/admin/automations', label: 'Automations', icon: Zap },
      { path: '/admin/presets', label: 'Presets', icon: Package },
      { path: '/admin/messaging', label: 'Messaging', icon: MessageSquare },
      { path: '/admin/custom-fields', label: 'Custom Fields', icon: FormInput },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/admin/roles', label: 'Roles', icon: Shield },
      { path: '/admin/diagnostics', label: 'Diagnostics', icon: Activity },
      { path: '/admin/billing', label: 'Billing', icon: CreditCard },
      { path: '/admin/settings', label: 'Settings', icon: Settings2 },
    ],
  },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation()
  const { signOut, userEmail } = useAuth()

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <motion.nav
      animate={{ width: collapsed ? 56 : 244 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      style={{
        height: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{
        padding: collapsed ? '14px 14px' : '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 52,
      }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          background: '#e11d48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Hexagon size={13} color="#fff" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              ServiceOS
            </span>
            <span style={{ fontSize: 10, color: '#666', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Admin
            </span>
          </motion.div>
        )}
      </div>

      <div style={{ flex: 1, padding: '6px 6px', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' }}>
        {sections.map((section, si) => (
          <div key={si}>
            {section.label && !collapsed && (
              <div style={{
                padding: '16px 10px 4px',
                fontSize: 10,
                fontWeight: 500,
                color: '#555',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {section.label}
              </div>
            )}
            {section.label && collapsed && <div style={{ height: 12 }} />}
            {section.items.map((item) => {
              const active = isActive(item.path, 'end' in item ? item.end : undefined)
              return (
                <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: collapsed ? '7px 12px' : '6px 10px',
                      borderRadius: 5,
                      color: active ? '#fff' : '#888',
                      background: active ? '#1a1a1a' : 'transparent',
                      transition: 'all 80ms ease',
                      cursor: 'pointer',
                      fontSize: 12.5,
                      fontWeight: active ? 500 : 400,
                      whiteSpace: 'nowrap',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#141414'; e.currentTarget.style.color = '#ccc' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#fff' : '#888' }}
                  >
                    <item.icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </NavLink>
              )
            })}
          </div>
        ))}
      </div>

      <div style={{
        padding: collapsed ? '10px 6px' : '10px 12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
      }}>
        {!collapsed && userEmail && (
          <span style={{ fontSize: 10.5, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail}
          </span>
        )}
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
          <button onClick={signOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, borderRadius: 4, display: 'flex' }}>
            <LogOut size={13} />
          </button>
          <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, borderRadius: 4, display: 'flex' }}>
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
