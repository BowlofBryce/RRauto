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
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
  pipeline_stage: string | null
  assigned_to: string | null
  created_at: string
}

export interface Job {
  id: string
  business_id: string
  contact_id: string
  service_type: string
  scheduled_date: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  price: number | null
  notes: string | null
  created_at: string
}

export interface Quote {
  id: string
  business_id: string
  contact_id: string
  amount: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  sent_date: string | null
  accepted_date: string | null
  notes: string | null
  created_at: string
}

export interface Communication {
  id: string
  business_id: string
  contact_id: string
  type: 'sms' | 'email'
  direction: 'sent' | 'received'
  message: string
  automation_id: string | null
  sent_at: string
  created_at: string
}

export interface PipelineStage {
  id: string
  business_id: string
  name: string
  stage_order: number
  created_at: string
}

export interface Automation {
  id: string
  business_id: string
  name: string
  trigger: string
  is_active: boolean
  conditions: unknown
  steps: AutomationStep[]
  created_at: string
}

export interface AutomationStep {
  delay_minutes: number
  action: string
  payload: Record<string, string>
  next_step?: number
}

export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  enabled: boolean
}
