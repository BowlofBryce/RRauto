import { supabase } from '../../lib/supabase'
import type { Quote, QuoteWithContact } from '../../types/crm.types'

export type { QuoteWithContact }

export async function getQuotes(businessId: string): Promise<QuoteWithContact[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, contacts(id,name,phone,email)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as QuoteWithContact[]
}

export async function createQuote(input: {
  business_id: string
  contact_id: string
  amount: number
  notes?: string | null
}): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Quote
}

export async function updateQuote(id: string, input: Partial<Omit<Quote, 'id' | 'created_at'>>): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Quote
}

export async function deleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}
