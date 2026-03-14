import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminSidebar } from './AdminSidebar'

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? 56 : 244

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ flex: 1, padding: '20px 28px', maxWidth: 1320, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}
