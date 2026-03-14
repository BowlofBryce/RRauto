import { supabase } from '../../lib/supabase'
import type { Contact } from '../../types/crm.types'

export async function getContacts(businessId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Contact[]
}

export async function getContact(id: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as Contact | null
}

export async function createContact(input: {
  business_id: string
  name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  tags?: string[]
}): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Contact
}

export async function updateContact(id: string, input: Partial<Omit<Contact, 'id' | 'created_at'>>): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Contact
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) throw error
}

export async function searchContacts(businessId: string, query: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('business_id', businessId)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Contact[]
}
