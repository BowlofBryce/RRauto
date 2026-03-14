import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Job } from '@/lib/types'

export function CalendarPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    api.get<Job[]>('/jobs').then(setJobs).finally(() => setLoading(false))
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = useMemo(() => {
    const arr: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    return arr
  }, [firstDay, daysInMonth])

  const jobsByDay = useMemo(() => {
    const map: Record<number, Job[]> = {}
    jobs.forEach((j) => {
      if (!j.scheduled_date) return
      const d = new Date(j.scheduled_date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day].push(j)
      }
    })
    return map
  }, [jobs, year, month])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const today = new Date()
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <PageHeader title="Calendar" description="View scheduled jobs by date." />

      <div style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Button size="sm" variant="ghost" onClick={prevMonth}><ChevronLeft size={16} /></Button>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)' as string }}>{monthLabel}</span>
          <Button size="sm" variant="ghost" onClick={nextMonth}><ChevronRight size={16} /></Button>
        </div>

        {loading ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
            Loading...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{
                padding: '8px',
                textAlign: 'center',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)' as string,
                color: 'var(--color-text-tertiary)',
                borderBottom: '1px solid var(--color-border)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dayJobs = day ? (jobsByDay[day] || []) : []
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.005 }}
                  style={{
                    minHeight: 80,
                    padding: '4px 6px',
                    borderRight: '1px solid var(--color-border-subtle)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    background: day && isToday(day) ? 'var(--color-primary-subtle)' : 'transparent',
                  }}
                >
                  {day && (
                    <>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: isToday(day) ? ('var(--weight-semibold)' as string) : ('var(--weight-normal)' as string),
                        color: isToday(day) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        marginBottom: 4,
                      }}>
                        {day}
                      </div>
                      {dayJobs.slice(0, 2).map((j) => (
                        <div
                          key={j.id}
                          style={{
                            fontSize: 10,
                            padding: '2px 4px',
                            background: j.status === 'completed' ? 'var(--color-success-subtle)' : 'var(--color-primary-subtle)',
                            color: j.status === 'completed' ? 'var(--color-success-text)' : 'var(--color-primary-text)',
                            borderRadius: 3,
                            marginBottom: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {j.service_type}
                        </div>
                      ))}
                      {dayJobs.length > 2 && (
                        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>+{dayJobs.length - 2} more</div>
                      )}
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {Object.keys(jobsByDay).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: 16 }}
        >
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' as string, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
            This Month
          </h3>
          <div style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {Object.entries(jobsByDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .flatMap(([day, dayJobs]) =>
                dayJobs.map((j) => (
                  <div key={j.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 'var(--text-sm)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', width: 36, textAlign: 'right' }}>{monthLabel.split(' ')[0]} {day}</span>
                    <span style={{ fontWeight: 'var(--weight-medium)' as string }}>{j.service_type}</span>
                    <StatusBadge status={j.status} />
                    {j.price && <span style={{ marginLeft: 'auto', color: 'var(--color-text-secondary)' }}>{formatCurrency(j.price)}</span>}
                  </div>
                ))
              )}
          </div>
        </motion.div>
      )}
    </>
  )
}
