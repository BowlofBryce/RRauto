export interface Business {
  id: string
  name: string
  slug: string
  industry: string
  settings: Record<string, unknown>
  created_at: string
}

export interface PipelineStage {
  id: string
  business_id: string
  name: string
  position: number
  color: string
  created_at: string
}

export interface Contact {
  id: string
  business_id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  tags: string[]
  notes: string | null
  created_at: string
}

export interface Lead {
  id: string
  business_id: string
  contact_id: string
  source: string
  status: string
  pipeline_stage_id: string | null
  assigned_to: string | null
  created_at: string
}

export interface LeadWithContact extends Lead {
  contacts: Pick<Contact, 'id' | 'name' | 'phone' | 'email'>
  pipeline_stages: Pick<PipelineStage, 'id' | 'name' | 'color' | 'position'> | null
}

export interface Quote {
  id: string
  business_id: string
  contact_id: string
  amount: number
  status: string
  sent_date: string | null
  accepted_date: string | null
  notes: string | null
  created_at: string
}

export interface QuoteWithContact extends Quote {
  contacts: Pick<Contact, 'id' | 'name' | 'phone' | 'email'>
}

export interface Job {
  id: string
  business_id: string
  contact_id: string
  service_type: string
  scheduled_date: string | null
  status: string
  price: number
  notes: string | null
  created_at: string
}

export interface JobWithContact extends Job {
  contacts: Pick<Contact, 'id' | 'name' | 'phone' | 'email' | 'address'>
}

export interface Communication {
  id: string
  business_id: string
  contact_id: string
  type: string
  message: string
  direction: string
  automation_id: string | null
  sent_at: string
}

export interface CommunicationWithContact extends Communication {
  contacts: Pick<Contact, 'id' | 'name'>
}

export interface Automation {
  id: string
  business_id: string
  name: string
  trigger: string
  conditions: Record<string, unknown>
  delay_minutes: number
  action: string
  action_config: Record<string, unknown>
  next_automation_id: string | null
  is_active: boolean
  created_at: string
}

export interface AutomationLog {
  id: string
  business_id: string
  automation_id: string | null
  contact_id: string | null
  action: string
  status: string
  error: string | null
  created_at: string
}

export interface AutomationQueueItem {
  id: string
  business_id: string
  automation_id: string
  contact_id: string
  payload: Record<string, unknown>
  scheduled_at: string
  status: string
  attempts: number
  created_at: string
}
