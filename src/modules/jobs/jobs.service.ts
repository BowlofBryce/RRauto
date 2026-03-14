import { supabase } from '../../lib/supabase'
import type { Job, JobWithContact } from '../../types/crm.types'

export type { JobWithContact }

export async function getJobs(businessId: string): Promise<JobWithContact[]> {
  const { data } = await supabase
    .from('jobs')
    .select('*, contacts(id,name,phone,email,address)')
    .eq('business_id', businessId)
    .order('scheduled_date', { ascending: true, nullsFirst: false })
  return (data ?? []) as unknown as JobWithContact[]
}

export async function createJob(input: {
  business_id: string
  contact_id: string
  service_type: string
  scheduled_date?: string | null
  price?: number
  notes?: string | null
}): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .insert(input)
    .select()
    .single()
  if (error) { console.error('createJob:', error); return null }
  return data as Job
}

export async function updateJob(id: string, input: Partial<Omit<Job, 'id' | 'created_at'>>): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateJob:', error); return null }
  return data as Job
}

export async function deleteJob(id: string): Promise<void> {
  await supabase.from('jobs').delete().eq('id', id)
}

export async function getUpcomingJobs(businessId: string, days = 7): Promise<JobWithContact[]> {
  const now = new Date().toISOString()
  const future = new Date(Date.now() + days * 86400000).toISOString()
  const { data } = await supabase
    .from('jobs')
    .select('*, contacts(id,name,phone,email,address)')
    .eq('business_id', businessId)
    .gte('scheduled_date', now)
    .lte('scheduled_date', future)
    .order('scheduled_date', { ascending: true })
  return (data ?? []) as unknown as JobWithContact[]
}
