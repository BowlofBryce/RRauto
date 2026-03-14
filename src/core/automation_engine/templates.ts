import { AutomationDefinition } from "./types.js";

export function defaultAutomationTemplates(businessId: string): Omit<AutomationDefinition, "id">[] {
  return [
    {
      business_id: businessId,
      name: "Lead Response Automation",
      trigger: "lead_created",
      is_active: true,
      conditions: [],
      steps: [
        {
          delay_minutes: 0,
          action: "send_sms",
          payload: { message: "Thanks {{contact_name}}, we just got your request and will reply shortly." }
        }
      ]
    },
    {
      business_id: businessId,
      name: "Quote Follow-Up Automation",
      trigger: "quote_sent",
      is_active: true,
      conditions: [],
      steps: [
        {
          delay_minutes: 24 * 60,
          action: "send_sms",
          payload: { message: "Hi {{contact_name}}, checking in on your quote. Want us to lock in a time?" }
        }
      ]
    },
    {
      business_id: businessId,
      name: "Appointment Reminder Automation",
      trigger: "job_scheduled",
      is_active: true,
      conditions: [],
      steps: [
        {
          delay_minutes: 60 * 24,
          action: "send_sms",
          payload: { message: "Reminder: your service appointment is coming up. Reply if you need to reschedule." }
        }
      ]
    },
    {
      business_id: businessId,
      name: "Review Request Automation",
      trigger: "job_completed",
      is_active: true,
      conditions: [],
      steps: [
        {
          delay_minutes: 120,
          action: "send_sms",
          payload: { message: "Thanks {{contact_name}}! Could you leave us a quick review?" }
        }
      ]
    },
    {
      business_id: businessId,
      name: "Customer Reactivation",
      trigger: "customer_inactive",
      is_active: true,
      conditions: [],
      steps: [
        {
          delay_minutes: 0,
          action: "send_email",
          payload: {
            subject: "We'd love to help again",
            body: "Hi {{contact_name}}, it's been a while. Here is a returning-customer promotion."
          }
        }
      ]
    },
    {
      business_id: businessId,
      name: "Missed Call Text Back",
      trigger: "missed_call",
      is_active: true,
      conditions: [],
      steps: [
        {
          delay_minutes: 0,
          action: "send_sms",
          payload: { message: "Sorry we missed your call. How can we help?" }
        }
      ]
    }
  ];
}
