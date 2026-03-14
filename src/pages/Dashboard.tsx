import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Users, TrendingUp, Wrench, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { getContacts } from '../modules/contacts/contacts.service'
import { getLeads } from '../modules/leads/leads.service'
import { getJobs, getUpcomingJobs } from '../modules/jobs/jobs.service'
import { getQuotes } from '../modules/quotes/quotes.service'
import { getAutomations } from '../modules/automations/automations.service'
import { StatCard } from '../components/ui/StatCard'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { formatDate } from '../lib/utils'
import type { JobWithContact } from '../modules/jobs/jobs.service'
import type { Automation } from '../types/crm.types'

type JobStatus = 'completed' | 'scheduled' | 'pending' | 'cancelled'
const jobBadge: Record<JobStatus, 'success' | 'warning' | 'muted' | 'danger'> = {
  completed: 'success',
  scheduled: 'warning',
  pending: 'muted',
  cancelled: 'danger',
}

const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }
const itemVariant = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
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
      getUpcomingJobs(business.id, 7),
    ]).then(([contacts, leads, jobs, , automations, upcomingJobs]) => {
      setCounts({
        contacts: contacts.length,
        leads: leads.length,
        jobs: jobs.length,
        automations: automations.filter((a) => a.is_active).length,
      })
      setUpcoming(upcomingJobs.slice(0, 5))
      setActiveAutos(automations.filter((a) => a.is_active).slice(0, 4))
      setLoading(false)
    })
  }, [business])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-text-primary">{business?.name ?? 'Dashboard'}</h1>
        <p className="text-sm text-text-tertiary mt-0.5">Overview of your operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Contacts" value={counts.contacts} icon={Users} accent="blue" index={0} />
            <StatCard label="Open Leads" value={counts.leads} icon={TrendingUp} accent="amber" index={1} />
            <StatCard label="Total Jobs" value={counts.jobs} icon={Wrench} accent="green" index={2} />
            <StatCard label="Active Flows" value={counts.automations} icon={Zap} accent="blue" index={3} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Upcoming Jobs</h2>
            <Link to="/jobs" className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <Wrench size={18} className="text-text-disabled mb-2" />
              <p className="text-sm text-text-tertiary">No upcoming jobs this week</p>
            </div>
          ) : (
            <motion.ul variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-border">
              {upcoming.map((job) => (
                <motion.li key={job.id} variants={itemVariant} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-3 transition-colors">
                  <Avatar name={job.contacts.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{job.contacts.name}</p>
                    <p className="text-xs text-text-tertiary truncate">{job.service_type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-text-secondary">{formatDate(job.scheduled_date)}</p>
                    <Badge variant={jobBadge[job.status as JobStatus] ?? 'muted'} className="mt-0.5">
                      {job.status}
                    </Badge>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>

        <div className="lg:col-span-2 bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Active Automations</h2>
            <Link to="/automations" className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : activeAutos.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <Zap size={18} className="text-text-disabled mb-2" />
              <p className="text-sm text-text-tertiary">No active automations</p>
            </div>
          ) : (
            <motion.ul variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-border">
              {activeAutos.map((auto) => (
                <motion.li key={auto.id} variants={itemVariant} className="px-5 py-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-md bg-success-subtle border border-success-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap size={10} className="text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{auto.name}</p>
                      <p className="text-xs text-text-tertiary mt-0.5 capitalize">
                        {auto.trigger.replace(/_/g, ' ')} → {auto.action.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </div>
  )
}
