import { Router } from "express";
import { listByBusiness, createRecord } from "../../shared/repository.js";
import { ScopedRequest } from "../../shared/business-scope.js";
import { enqueueAutomationTrigger } from "../../core/automation_engine/engine.js";

export const quotesRouter = Router();

quotesRouter.get("/", async (req, res) => {
  const rows = await listByBusiness("quotes", (req as ScopedRequest).businessId);
  res.json(rows);
});

quotesRouter.post("/", async (req, res) => {
  const businessId = (req as ScopedRequest).businessId;
  const created = await createRecord<{ contact_id: string; id: string }>("quotes", businessId, req.body);

  await enqueueAutomationTrigger({
    businessId,
    trigger: "quote_sent",
    contactId: created.contact_id,
    context: { quote_id: created.id }
  });

  res.status(201).json(created);
});
