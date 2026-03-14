import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? 56 : 240

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          flex: 1,
          padding: '24px 32px',
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
        }}>
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}
