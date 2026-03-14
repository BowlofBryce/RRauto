import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BusinessProvider } from './context/BusinessContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Contacts } from './pages/Contacts'
import { Pipeline } from './pages/Pipeline'
import { Jobs } from './pages/Jobs'
import { Quotes } from './pages/Quotes'
import { Communications } from './pages/Communications'
import { Automations } from './pages/Automations'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <ThemeProvider>
      <BusinessProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/leads" element={<Pipeline />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BusinessProvider>
    </ThemeProvider>
  )
}
