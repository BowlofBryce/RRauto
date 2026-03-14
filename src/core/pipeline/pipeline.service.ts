import { supabase } from '../../lib/supabase'
import type { PipelineStage } from '../../types/crm.types'

export async function getPipelineStages(businessId: string): Promise<PipelineStage[]> {
  const { data } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('business_id', businessId)
    .order('position', { ascending: true })
  return (data ?? []) as PipelineStage[]
}

export async function createPipelineStage(input: {
  business_id: string
  name: string
  position?: number
  color?: string
}): Promise<PipelineStage | null> {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .insert(input)
    .select()
    .single()
  if (error) { console.error('createPipelineStage:', error); return null }
  return data as PipelineStage
}

export async function updatePipelineStage(id: string, input: Partial<Omit<PipelineStage, 'id' | 'created_at'>>): Promise<PipelineStage | null> {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updatePipelineStage:', error); return null }
  return data as PipelineStage
}

export async function deletePipelineStage(id: string): Promise<void> {
  await supabase.from('pipeline_stages').delete().eq('id', id)
}
