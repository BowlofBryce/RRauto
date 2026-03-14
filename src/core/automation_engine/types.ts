export type AutomationTrigger =
  | "lead_created"
  | "quote_sent"
  | "job_scheduled"
  | "job_completed"
  | "customer_inactive"
  | "missed_call";

export type AutomationAction = "send_sms" | "send_email" | "create_task" | "update_pipeline_stage";

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains";
  value: string;
}

export interface AutomationStep {
  delay_minutes: number;
  action: AutomationAction;
  payload: Record<string, string>;
  next_step?: number;
}

export interface AutomationDefinition extends Record<string, unknown> {
  id: string;
  business_id: string;
  name: string;
  trigger: AutomationTrigger;
  is_active: boolean;
  conditions: AutomationCondition[];
  steps: AutomationStep[];
}
