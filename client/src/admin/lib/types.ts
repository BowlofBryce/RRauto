export interface Business {
  id: string
  name: string
  slug: string
  timezone: string
  status: string
  plan: string
  preset_id: string | null
  branding: Record<string, unknown>
  onboarding_step: number
  created_at: string
}

export interface PlatformModule {
  id: string
  name: string
  description: string
  category: string
  icon: string
  is_default: boolean
  depends_on: string[]
  sort_order: number
  created_at: string
}

export interface BusinessModule {
  business_id: string
  module_id: string
  enabled: boolean
  enabled_at: string
}

export interface FeatureFlag {
  id: string
  name: string
  description: string
  module_id: string | null
  is_global: boolean
  default_enabled: boolean
  created_at: string
}

export interface BusinessFeatureFlag {
  business_id: string
  flag_id: string
  enabled: boolean
}

export interface Preset {
  id: string
  slug: string
  name: string
  description: string
  category: string
  config: PresetConfig
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface PresetConfig {
  modules?: string[]
  service_types?: string[]
  pipeline_stages?: string[]
  max_contacts?: number
  max_automations?: number
}

export interface MessagingTemplate {
  id: string
  business_id: string | null
  name: string
  channel: string
  trigger: string
  subject: string | null
  body: string
  is_default: boolean
  created_at: string
}

export interface CustomField {
  id: string
  business_id: string
  entity: string
  field_name: string
  field_type: string
  options: unknown
  is_required: boolean
  sort_order: number
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  business_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown>
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
}

export interface BusinessUser {
  user_id: string
  business_id: string
  role: string
  created_at: string
}
