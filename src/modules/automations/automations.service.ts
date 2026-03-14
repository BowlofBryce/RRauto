import { supabase } from '../../lib/supabase'
import type { Automation, AutomationLog } from '../../types/crm.types'

export async function getAutomations(businessId: string): Promise<Automation[]> {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw error
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
}): Promise<Automation> {
  const { data, error } = await supabase
    .from('automations')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Automation
}

export async function updateAutomation(id: string, input: Partial<Omit<Automation, 'id' | 'created_at'>>): Promise<Automation> {
  const { data, error } = await supabase
    .from('automations')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Automation
}

export async function deleteAutomation(id: string): Promise<void> {
  const { error } = await supabase.from('automations').delete().eq('id', id)
  if (error) throw error
}

export async function toggleAutomation(id: string, isActive: boolean): Promise<Automation> {
  return updateAutomation(id, { is_active: isActive })
}

export async function getAutomationLogs(businessId: string): Promise<AutomationLog[]> {
  const { data, error } = await supabase
    .from('automation_logs')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []) as AutomationLog[]
}
