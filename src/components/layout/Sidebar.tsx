import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  LayoutDashboard, Users, TrendingUp, FileText,
  Wrench, MessageSquare, Zap, Settings,
} from 'lucide-react'
import { useBusiness } from '../../context/BusinessContext'
import { Avatar } from '../ui/Avatar'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/contacts', icon: Users, label: 'Contacts', exact: false },
  { to: '/leads', icon: TrendingUp, label: 'Pipeline', exact: false },
  { to: '/quotes', icon: FileText, label: 'Quotes', exact: false },
  { to: '/jobs', icon: Wrench, label: 'Jobs', exact: false },
  { to: '/communications', icon: MessageSquare, label: 'Inbox', exact: false },
  { to: '/automations', icon: Zap, label: 'Automations', exact: false },
]

export function Sidebar() {
  const { business } = useBusiness()
  const location = useLocation()

  return (
    <aside
      className="flex flex-col w-[220px] h-screen sticky top-0 flex-shrink-0"
      style={{ backgroundColor: 'var(--raised)', borderRight: '1px solid var(--border)' }}
    >
      <div className="px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            <span className="text-white text-xs font-bold leading-none">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-1 truncate leading-tight">
              {business?.name ?? 'ServiceCRM'}
            </p>
            <p className="text-[11px] text-4 capitalize leading-tight">
              {business?.industry?.replace(/_/g, ' ') ?? '—'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] group outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-md"
                  style={{ backgroundColor: 'var(--subtle)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <Icon
                size={15}
                className="relative z-10 flex-shrink-0 transition-colors duration-100"
                style={{ color: isActive ? 'var(--fg)' : 'var(--fg-4)' }}
              />
              <span
                className="relative z-10 font-medium transition-colors duration-100"
                style={{ color: isActive ? 'var(--fg)' : 'var(--fg-3)' }}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="px-2 py-3 space-y-0.5" style={{ borderTop: '1px solid var(--border)' }}>
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] outline-none"
          style={({ isActive }) => ({
            backgroundColor: isActive ? 'var(--subtle)' : 'transparent',
            color: isActive ? 'var(--fg)' : 'var(--fg-3)',
          })}
        >
          <Settings size={15} className="flex-shrink-0" />
          <span className="font-medium">Settings</span>
        </NavLink>

        {business && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1">
            <Avatar name={business.name} size="sm" />
            <p className="text-[12px] font-medium text-2 truncate">{business.name}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
