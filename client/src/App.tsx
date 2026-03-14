import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/Toast'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { ContactsPage } from '@/pages/Contacts'
import { LeadsPage } from '@/pages/Leads'
import { PipelinePage } from '@/pages/Pipeline'
import { QuotesPage } from '@/pages/Quotes'
import { JobsPage } from '@/pages/Jobs'
import { CalendarPage } from '@/pages/Calendar'
import { CommunicationsPage } from '@/pages/Communications'
import { AutomationsPage } from '@/pages/Automations'
import { ReviewsPage } from '@/pages/Reviews'
import { ReportingPage } from '@/pages/Reporting'
import { SettingsPage } from '@/pages/Settings'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { token, businessId, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-tertiary)',
        fontSize: 'var(--text-sm)',
      }}>
        Loading...
      </div>
    )
  }

  if (!token || !businessId) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="communications" element={<CommunicationsPage />} />
        <Route path="automations" element={<AutomationsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reporting" element={<ReportingPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
