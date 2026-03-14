import { db } from "../../database/connection.js";
import { sendEmail } from "../../services/email/index.js";
import { sendSMS } from "../../services/sms/index.js";
import { AutomationDefinition, AutomationStep, AutomationTrigger } from "./types.js";

export async function enqueueAutomationTrigger(input: {
  businessId: string;
  trigger: AutomationTrigger;
  contactId: string;
  context?: Record<string, string>;
}): Promise<void> {
  const { rows } = await db.query<AutomationDefinition>(
    `SELECT id, business_id, name, trigger, is_active, conditions, steps
     FROM automations
     WHERE business_id = $1 AND trigger = $2 AND is_active = true`,
    [input.businessId, input.trigger]
  );

  for (const automation of rows) {
    await db.query(
      `INSERT INTO automation_queue (business_id, automation_id, contact_id, step_index, run_at, context)
       VALUES ($1, $2, $3, $4, NOW(), $5::jsonb)`,
      [input.businessId, automation.id, input.contactId, 0, JSON.stringify(input.context ?? {})]
    );
  }
}

export async function processAutomationQueue(limit = 50): Promise<number> {
  const { rows } = await db.query<{
    id: string;
    business_id: string;
    automation_id: string;
    contact_id: string;
    step_index: number;
    context: Record<string, string>;
  }>(
    `SELECT * FROM automation_queue
     WHERE status = 'queued' AND run_at <= NOW()
     ORDER BY run_at ASC
     LIMIT $1`,
    [limit]
  );

  for (const item of rows) {
    await executeQueueItem(item);
  }

  return rows.length;
}

async function executeQueueItem(item: {
  id: string;
  business_id: string;
  automation_id: string;
  contact_id: string;
  step_index: number;
  context: Record<string, string>;
}): Promise<void> {
  try {
    const automation = await loadAutomation(item.automation_id, item.business_id);
    const step = automation.steps[item.step_index];

    if (!step) {
      await markDone(item.id, item.business_id, automation.id, item.contact_id, "workflow_complete");
      return;
    }

    await runAction(step, item);

    await db.query(
      `INSERT INTO automation_logs (business_id, automation_id, contact_id, action, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [item.business_id, item.automation_id, item.contact_id, step.action, "success"]
    );

    const nextIndex = step.next_step ?? item.step_index + 1;
    if (automation.steps[nextIndex]) {
      await db.query(
        `INSERT INTO automation_queue (business_id, automation_id, contact_id, step_index, run_at, context)
         VALUES ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 minute'), $6::jsonb)`,
        [item.business_id, item.automation_id, item.contact_id, nextIndex, automation.steps[nextIndex].delay_minutes, JSON.stringify(item.context)]
      );
    }

    await db.query("UPDATE automation_queue SET status = 'processed', processed_at = NOW() WHERE id = $1", [item.id]);
  } catch (error) {
    await db.query("UPDATE automation_queue SET status = 'failed', processed_at = NOW() WHERE id = $1", [item.id]);
    await db.query(
      `INSERT INTO automation_logs (business_id, automation_id, contact_id, action, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [item.business_id, item.automation_id, item.contact_id, "queue_execution", "failed"]
    );
    throw error;
  }
}

async function runAction(
  step: AutomationStep,
  item: { business_id: string; contact_id: string; context: Record<string, string> }
): Promise<void> {
  const contact = await db.query<{ phone: string; email: string; name: string }>(
    "SELECT phone, email, name FROM contacts WHERE id = $1 AND business_id = $2",
    [item.contact_id, item.business_id]
  );

  const profile = contact.rows[0];

  switch (step.action) {
    case "send_sms":
      await sendSMS({
        to: profile.phone,
        message: template(step.payload.message ?? "", profile.name),
        businessId: item.business_id
      });
      break;
    case "send_email":
      await sendEmail({
        to: profile.email,
        subject: template(step.payload.subject ?? "", profile.name),
        html: template(step.payload.body ?? "", profile.name),
        businessId: item.business_id
      });
      break;
    case "update_pipeline_stage":
      await db.query("UPDATE leads SET pipeline_stage = $1 WHERE contact_id = $2 AND business_id = $3", [
        step.payload.stage,
        item.contact_id,
        item.business_id
      ]);
      break;
    case "create_task":
      await db.query(
        `INSERT INTO tasks (business_id, contact_id, title, status)
         VALUES ($1, $2, $3, 'open')`,
        [item.business_id, item.contact_id, step.payload.title ?? "Follow up"]
      );
      break;
  }
}

function template(text: string, contactName: string): string {
  return text.replaceAll("{{contact_name}}", contactName);
}

async function loadAutomation(automationId: string, businessId: string): Promise<AutomationDefinition> {
  const { rows } = await db.query<AutomationDefinition>(
    `SELECT id, business_id, name, trigger, is_active, conditions, steps
     FROM automations WHERE id = $1 AND business_id = $2`,
    [automationId, businessId]
  );

  if (!rows[0]) {
    throw new Error(`Automation ${automationId} not found`);
  }

  return rows[0];
}

async function markDone(
  queueId: string,
  businessId: string,
  automationId: string,
  contactId: string,
  action: string
): Promise<void> {
  await db.query("UPDATE automation_queue SET status = 'processed', processed_at = NOW() WHERE id = $1", [queueId]);
  await db.query(
    `INSERT INTO automation_logs (business_id, automation_id, contact_id, action, status)
     VALUES ($1, $2, $3, $4, 'success')`,
    [businessId, automationId, contactId, action]
  );
}
