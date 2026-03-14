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

automationsRouter.patch("/:id", async (req, res) => {
  const businessId = (req as unknown as ScopedRequest).businessId;
  const { is_active, name } = req.body;
  const sets: string[] = [];
  const values: unknown[] = [req.params.id, businessId];

  if (is_active !== undefined) { sets.push(`is_active = $${values.length + 1}`); values.push(is_active); }
  if (name !== undefined) { sets.push(`name = $${values.length + 1}`); values.push(name); }

  if (!sets.length) { res.status(400).json({ error: "Nothing to update" }); return; }

  const { rows } = await db.query(
    `UPDATE automations SET ${sets.join(", ")} WHERE id = $1 AND business_id = $2 RETURNING *`,
    values
  );
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rows[0]);
});

automationsRouter.delete("/:id", async (req, res) => {
  const { rows } = await db.query(
    "DELETE FROM automations WHERE id = $1 AND business_id = $2 RETURNING id",
    [req.params.id, (req as unknown as ScopedRequest).businessId]
  );
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});

automationsRouter.post("/events/missed-call", async (req, res) => {
  const businessId = (req as ScopedRequest).businessId;
  const { contact_id } = req.body;

  await enqueueAutomationTrigger({ businessId, trigger: "missed_call", contactId: contact_id });
  res.status(202).json({ queued: true });
});
