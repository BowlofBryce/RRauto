import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  LayoutDashboard, Users, TrendingUp, FileText,
  Wrench, MessageSquare, Zap, Settings,
} from 'lucide-react'
import { useBusiness } from '../../context/BusinessContext'

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

  const initial = (name: string) => name ? name.charAt(0).toUpperCase() : 'S'

  return (
    <aside
      className="flex flex-col w-[200px] h-screen sticky top-0 flex-shrink-0"
      style={{ backgroundColor: 'var(--raised)', borderRight: '1px solid var(--border)' }}
    >
      <div className="px-4 h-[52px] flex items-center gap-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          {initial(business?.name ?? 'S')}
        </div>
        <span className="text-[13px] font-semibold text-1 truncate">
          {business?.name ?? 'ServiceCRM'}
        </span>
      </div>

      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex items-center gap-2 px-2.5 py-[6px] rounded-[7px] mb-0.5 text-[13px] group outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-[7px]"
                  style={{ backgroundColor: 'var(--subtle)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icon
                size={14}
                className="relative z-10 flex-shrink-0"
                style={{ color: isActive ? 'var(--brand)' : 'var(--fg-4)' }}
              />
              <span
                className="relative z-10 font-medium"
                style={{ color: isActive ? 'var(--fg)' : 'var(--fg-3)' }}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="px-2 pb-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <NavLink
          to="/settings"
          className="flex items-center gap-2 px-2.5 py-[6px] rounded-[7px] text-[13px] outline-none"
          style={({ isActive }) => ({
            backgroundColor: isActive ? 'var(--subtle)' : 'transparent',
            color: isActive ? 'var(--fg)' : 'var(--fg-3)',
          })}
        >
          <Settings size={14} className="flex-shrink-0" style={{ color: 'var(--fg-4)' }} />
          <span className="font-medium">Settings</span>
        </NavLink>

        {business && (
          <div className="mt-3 mx-1 flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
              style={{ backgroundColor: 'var(--fg-4)' }}
            >
              {initial(business.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-2 truncate leading-tight">{business.name}</p>
              <p className="text-[10px] text-4 capitalize leading-tight">{business.industry?.replace(/_/g, ' ')}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
