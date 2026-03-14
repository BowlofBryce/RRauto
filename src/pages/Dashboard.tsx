import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Users, TrendingUp, Wrench, Zap, ArrowRight, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { getContacts } from '../modules/contacts/contacts.service'
import { getLeads } from '../modules/leads/leads.service'
import { getJobs, getUpcomingJobs } from '../modules/jobs/jobs.service'
import { getQuotes } from '../modules/quotes/quotes.service'
import { getAutomations } from '../modules/automations/automations.service'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { formatDate, formatCurrency } from '../lib/utils'
import type { JobWithContact } from '../modules/jobs/jobs.service'
import type { Automation } from '../types/crm.types'

type JobStatus = 'completed' | 'scheduled' | 'pending' | 'cancelled'
const jobBadge: Record<JobStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
  completed: 'success',
  scheduled: 'warning',
  pending: 'neutral',
  cancelled: 'danger',
}

export function Dashboard() {
  const { business } = useBusiness()
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ contacts: 0, leads: 0, jobs: 0, automations: 0 })
  const [upcoming, setUpcoming] = useState<JobWithContact[]>([])
  const [activeAutos, setActiveAutos] = useState<Automation[]>([])

  useEffect(() => {
    if (!business) return
    Promise.all([
      getContacts(business.id),
      getLeads(business.id),
      getJobs(business.id),
      getQuotes(business.id),
      getAutomations(business.id),
      getUpcomingJobs(business.id, 14),
    ]).then(([contacts, leads, jobs, , automations, upcomingJobs]) => {
      setCounts({
        contacts: contacts.length,
        leads: leads.length,
        jobs: jobs.length,
        automations: automations.filter((a) => a.is_active).length,
      })
      setUpcoming(upcomingJobs.slice(0, 6))
      setActiveAutos(automations.filter((a) => a.is_active).slice(0, 5))
      setLoading(false)
    })
  }, [business])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-1 tracking-[-0.4px]">
          {business?.name ?? 'Dashboard'}
        </h1>
        <p className="text-[13px] text-3 mt-0.5">Here's what's happening with your business</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[102px] rounded-xl" />)
        ) : (
          <>
            <StatCard label="Contacts" value={counts.contacts} icon={Users} accent="blue" index={0} />
            <StatCard label="Open Leads" value={counts.leads} icon={TrendingUp} accent="amber" index={1} />
            <StatCard label="Total Jobs" value={counts.jobs} icon={Wrench} accent="green" index={2} />
            <StatCard label="Active Flows" value={counts.automations} icon={Zap} accent="blue" index={3} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="text-[14px] font-semibold text-1">Upcoming Jobs</h2>
              <p className="text-[12px] text-3 mt-0.5">Next 14 days</p>
            </div>
            <Link to="/jobs" className="flex items-center gap-1 text-[12px] text-brand hover:opacity-80 transition-opacity">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-14">
              <div className="h-10 w-10 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--subtle)' }}>
                <Calendar size={18} className="text-4" />
              </div>
              <p className="text-[13px] font-medium text-2">No jobs scheduled</p>
              <p className="text-[12px] text-4 mt-0.5">Upcoming jobs will appear here</p>
            </div>
          ) : (
            <div className="divide-app">
              {upcoming.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
                  className="flex items-center gap-4 px-5 py-3.5 row-hover transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-1 truncate">{job.contacts.name}</p>
                    <p className="text-[12px] text-3 truncate mt-0.5">{job.service_type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[12px] text-2">{formatDate(job.scheduled_date)}</p>
                    {job.price > 0 && <p className="text-[11px] text-4 mt-0.5 tabular-nums">{formatCurrency(job.price)}</p>}
                  </div>
                  <Badge variant={jobBadge[job.status as JobStatus] ?? 'neutral'}>
                    {job.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="text-[14px] font-semibold text-1">Automations</h2>
              <p className="text-[12px] text-3 mt-0.5">{counts.automations} active</p>
            </div>
            <Link to="/automations" className="flex items-center gap-1 text-[12px] text-brand hover:opacity-80 transition-opacity">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : activeAutos.length === 0 ? (
            <div className="flex flex-col items-center py-14">
              <div className="h-10 w-10 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--subtle)' }}>
                <Zap size={18} className="text-4" />
              </div>
              <p className="text-[13px] font-medium text-2">No automations</p>
              <p className="text-[12px] text-4 mt-0.5">Create workflows to save time</p>
            </div>
          ) : (
            <div className="divide-app">
              {activeAutos.map((auto, i) => (
                <motion.div
                  key={auto.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
                  className="px-5 py-3.5 row-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--green-bg)' }}>
                      <Zap size={11} className="text-green" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-1 truncate">{auto.name}</p>
                      <p className="text-[11px] text-3 mt-0.5 capitalize truncate">
                        {auto.trigger.replace(/_/g, ' ')} → {auto.action.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
