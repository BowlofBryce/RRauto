import { Router } from "express";
import { listByBusiness, createRecord } from "../../shared/repository.js";
import { ScopedRequest } from "../../shared/business-scope.js";
import { enqueueAutomationTrigger } from "../../core/automation_engine/engine.js";

export const leadsRouter = Router();

leadsRouter.get("/", async (req, res) => {
  const rows = await listByBusiness("leads", (req as ScopedRequest).businessId);
  res.json(rows);
});

leadsRouter.post("/", async (req, res) => {
  const businessId = (req as ScopedRequest).businessId;
  const created = await createRecord<{ contact_id: string; id: string }>("leads", businessId, req.body);

  await enqueueAutomationTrigger({
    businessId,
    trigger: "lead_created",
    contactId: created.contact_id,
    context: { lead_id: created.id }
  });

  res.status(201).json(created);
});
