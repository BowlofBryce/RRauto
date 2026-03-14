import { Router } from "express";
import { db } from "../../database/connection.js";
import { ScopedRequest } from "../../shared/business-scope.js";
import { defaultAutomationTemplates } from "../../core/automation_engine/templates.js";
import { enqueueAutomationTrigger, processAutomationQueue } from "../../core/automation_engine/engine.js";

export const automationsRouter = Router();

automationsRouter.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM automations WHERE business_id = $1 ORDER BY created_at DESC", [
    (req as ScopedRequest).businessId
  ]);
  res.json(rows);
});

automationsRouter.post("/", async (req, res) => {
  const businessId = (req as ScopedRequest).businessId;
  const { name, trigger, is_active, conditions, steps } = req.body;

  const { rows } = await db.query(
    `INSERT INTO automations (business_id, name, trigger, is_active, conditions, steps)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
     RETURNING *`,
    [businessId, name, trigger, is_active ?? true, JSON.stringify(conditions ?? []), JSON.stringify(steps ?? [])]
  );

  res.status(201).json(rows[0]);
});

automationsRouter.post("/install-defaults", async (req, res) => {
  const businessId = (req as ScopedRequest).businessId;
  const templates = defaultAutomationTemplates(businessId);

  for (const template of templates) {
    await db.query(
      `INSERT INTO automations (business_id, name, trigger, is_active, conditions, steps)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
       ON CONFLICT (business_id, name) DO NOTHING`,
      [
        businessId,
        template.name,
        template.trigger,
        template.is_active,
        JSON.stringify(template.conditions),
        JSON.stringify(template.steps)
      ]
    );
  }

  res.status(201).json({ installed: templates.length });
});

automationsRouter.post("/queue/process", async (_req, res) => {
  const processed = await processAutomationQueue();
  res.json({ processed });
});

automationsRouter.post("/events/missed-call", async (req, res) => {
  const businessId = (req as ScopedRequest).businessId;
  const { contact_id } = req.body;

  await enqueueAutomationTrigger({ businessId, trigger: "missed_call", contactId: contact_id });
  res.status(202).json({ queued: true });
});
