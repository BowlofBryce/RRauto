import { Router } from "express";
import { listByBusiness, createRecord, updateRecord, deleteRecord } from "../../shared/repository.js";
import { ScopedRequest } from "../../shared/business-scope.js";
import { enqueueAutomationTrigger } from "../../core/automation_engine/engine.js";

export const jobsRouter = Router();

jobsRouter.get("/", async (req, res) => {
  const rows = await listByBusiness("jobs", (req as ScopedRequest).businessId);
  res.json(rows);
});

jobsRouter.post("/", async (req, res) => {
  const businessId = (req as ScopedRequest).businessId;
  const created = await createRecord<{ contact_id: string; id: string; status: string }>("jobs", businessId, req.body);

  await enqueueAutomationTrigger({
    businessId,
    trigger: "job_scheduled",
    contactId: created.contact_id,
    context: { job_id: created.id },
  });

  if (created.status === "completed") {
    await enqueueAutomationTrigger({
      businessId,
      trigger: "job_completed",
      contactId: created.contact_id,
      context: { job_id: created.id },
    });
  }

  res.status(201).json(created);
});

jobsRouter.patch("/:id", async (req, res) => {
  const businessId = (req as unknown as ScopedRequest).businessId;
  const updated = await updateRecord<{ contact_id: string; id: string; status: string }>(
    "jobs",
    req.params.id,
    businessId,
    req.body
  );
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  if (req.body.status === "completed") {
    await enqueueAutomationTrigger({
      businessId,
      trigger: "job_completed",
      contactId: updated.contact_id,
      context: { job_id: updated.id },
    });
  }

  res.json(updated);
});

jobsRouter.delete("/:id", async (req, res) => {
  const deleted = await deleteRecord("jobs", req.params.id, (req as unknown as ScopedRequest).businessId);
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});
