import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/Toast'
import { AppShell } from '@/components/layout/AppShell'
import { AdminShell } from '@/admin/layouts/AdminShell'
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
import { OverviewPage } from '@/admin/modules/overview/OverviewPage'
import { BusinessListPage } from '@/admin/modules/businesses/BusinessListPage'
import { BusinessDetailPage } from '@/admin/modules/businesses/BusinessDetailPage'
import { ModulesRegistryPage } from '@/admin/modules/modules-registry/ModulesRegistryPage'
import { FeatureFlagsPage } from '@/admin/modules/feature-flags/FeatureFlagsPage'
import { AutomationsAdminPage } from '@/admin/modules/automations/AutomationsAdminPage'
import { PresetsPage } from '@/admin/modules/presets/PresetsPage'
import { MessagingPage } from '@/admin/modules/messaging/MessagingPage'
import { CustomFieldsPage } from '@/admin/modules/custom-fields/CustomFieldsPage'
import { RolesPage } from '@/admin/modules/roles/RolesPage'
import { DiagnosticsPage } from '@/admin/modules/diagnostics/DiagnosticsPage'
import { BillingPage } from '@/admin/modules/billing/BillingPage'
import { SystemSettingsPage } from '@/admin/modules/system-settings/SystemSettingsPage'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()

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

  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminShell />
          </RequireAuth>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="businesses" element={<BusinessListPage />} />
        <Route path="businesses/:id" element={<BusinessDetailPage />} />
        <Route path="modules" element={<ModulesRegistryPage />} />
        <Route path="feature-flags" element={<FeatureFlagsPage />} />
        <Route path="automations" element={<AutomationsAdminPage />} />
        <Route path="presets" element={<PresetsPage />} />
        <Route path="messaging" element={<MessagingPage />} />
        <Route path="custom-fields" element={<CustomFieldsPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="diagnostics" element={<DiagnosticsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
      </Route>

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
