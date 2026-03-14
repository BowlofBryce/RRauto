import { supabase } from '../../lib/supabase'
import type { Lead, LeadWithContact } from '../../types/crm.types'

export type { LeadWithContact }

export async function getLeads(businessId: string): Promise<LeadWithContact[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, contacts(id,name,phone,email), pipeline_stages(id,name,color,position)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as LeadWithContact[]
}

export async function createLead(input: {
  business_id: string
  contact_id: string
  source?: string
  pipeline_stage_id?: string | null
}): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Lead
}

export async function updateLead(id: string, input: Partial<Omit<Lead, 'id' | 'created_at'>>): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Lead
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}
