import { supabase } from '../../lib/supabase'
import type { Automation, AutomationLog } from '../../types/crm.types'

export async function getAutomations(businessId: string): Promise<Automation[]> {
  const { data } = await supabase
    .from('automations')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Automation[]
}

export async function createAutomation(input: {
  business_id: string
  name: string
  trigger: string
  action: string
  conditions?: Record<string, unknown>
  delay_minutes?: number
  action_config?: Record<string, unknown>
  is_active?: boolean
}): Promise<Automation | null> {
  const { data, error } = await supabase
    .from('automations')
    .insert(input)
    .select()
    .single()
  if (error) { console.error('createAutomation:', error); return null }
  return data as Automation
}

export async function updateAutomation(id: string, input: Partial<Omit<Automation, 'id' | 'created_at'>>): Promise<Automation | null> {
  const { data, error } = await supabase
    .from('automations')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateAutomation:', error); return null }
  return data as Automation
}

export async function deleteAutomation(id: string): Promise<void> {
  await supabase.from('automations').delete().eq('id', id)
}

export async function toggleAutomation(id: string, isActive: boolean): Promise<Automation | null> {
  return updateAutomation(id, { is_active: isActive })
}

export async function getAutomationLogs(businessId: string): Promise<AutomationLog[]> {
  const { data } = await supabase
    .from('automation_logs')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as AutomationLog[]
}
