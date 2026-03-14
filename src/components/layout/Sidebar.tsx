import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  LayoutDashboard, Users, TrendingUp, FileText,
  Wrench, MessageSquare, Zap, Settings, ChevronRight,
} from 'lucide-react'
import { useBusiness } from '../../context/BusinessContext'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/utils'

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
    <aside className="flex flex-col w-56 bg-surface-1 border-r border-border h-screen sticky top-0 flex-shrink-0">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate leading-tight">
              {business?.name ?? 'ServiceCRM'}
            </p>
            <p className="text-[10px] text-text-tertiary capitalize leading-tight">
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
              className={cn(
                'relative flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors duration-100 group',
                isActive
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-2'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-surface-3 rounded-md"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <Icon size={15} className={cn(
                'relative z-10 flex-shrink-0',
                isActive ? 'text-text-primary' : 'text-text-disabled group-hover:text-text-tertiary'
              )} />
              <span className="relative z-10 font-medium">{label}</span>
              {isActive && <ChevronRight size={11} className="relative z-10 ml-auto text-text-disabled" />}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm',
            location.pathname === '/settings'
              ? 'bg-surface-3 text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-colors duration-100'
          )}
        >
          <Settings size={15} className="flex-shrink-0" />
          <span className="font-medium">Settings</span>
        </NavLink>

        {business && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1">
            <Avatar name={business.name} size="sm" />
            <p className="text-xs font-medium text-text-secondary truncate">{business.name}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
