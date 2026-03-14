import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Target, Kanban, FileText, Briefcase, Calendar, MessageSquare, Zap, Star, ChartBar as BarChart3, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/leads', label: 'Leads', icon: Target },
  { path: '/pipeline', label: 'Pipeline', icon: Kanban },
  { path: '/quotes', label: 'Quotes', icon: FileText },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/communications', label: 'Messages', icon: MessageSquare },
  { path: '/automations', label: 'Automations', icon: Zap },
  { path: '/reviews', label: 'Reviews', icon: Star },
  { path: '/reporting', label: 'Reporting', icon: BarChart3 },
]

const bottomItems = [
  { path: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { signOut, userEmail } = useAuth()

  return (
    <motion.nav
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        height: '100vh',
        background: 'var(--color-sidebar-bg)',
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
        padding: collapsed ? '16px 12px' : '16px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 56,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-sidebar-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Briefcase size={14} color="#fff" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--weight-semibold)' as string,
              color: 'var(--color-sidebar-text-active)',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
          >
            ServiceOS
          </motion.span>
        )}
      </div>

      <div style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          return (
            <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '8px 10px' : '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--color-sidebar-text-active)' : 'var(--color-sidebar-text)',
                  background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                  transition: 'all 100ms ease',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? ('var(--weight-medium)' as string) : ('var(--weight-normal)' as string),
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-sidebar-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <item.icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 16,
                      borderRadius: 2,
                      background: 'var(--color-sidebar-accent)',
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
              </div>
            </NavLink>
          )
        })}
      </div>

      <div style={{ padding: '4px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {bottomItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--color-sidebar-text-active)' : 'var(--color-sidebar-text)',
                  background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                  fontSize: 'var(--text-sm)',
                  transition: 'all 100ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-sidebar-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <item.icon size={16} style={{ flexShrink: 0, opacity: 0.7 }} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </NavLink>
          )
        })}
      </div>

      <div style={{
        padding: collapsed ? '12px 8px' : '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        {!collapsed && userEmail && (
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-sidebar-text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {userEmail}
          </span>
        )}
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button
            onClick={signOut}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-sidebar-text)',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
            }}
          >
            <LogOut size={14} />
          </button>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-sidebar-text)',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
