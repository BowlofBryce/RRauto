import { supabase } from '../../lib/supabase'
import type { Communication, CommunicationWithContact } from '../../types/crm.types'

export type { CommunicationWithContact }

export async function getCommunications(businessId: string): Promise<CommunicationWithContact[]> {
  const { data } = await supabase
    .from('communications')
    .select('*, contacts(id,name)')
    .eq('business_id', businessId)
    .order('sent_at', { ascending: false })
  return (data ?? []) as unknown as CommunicationWithContact[]
}

export async function logCommunication(input: {
  business_id: string
  contact_id: string
  type: string
  message: string
  direction?: string
  automation_id?: string | null
}): Promise<Communication | null> {
  const { data, error } = await supabase
    .from('communications')
    .insert(input)
    .select()
    .single()
  if (error) { console.error('logCommunication:', error); return null }
  return data as Communication
}
