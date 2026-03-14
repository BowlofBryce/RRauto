import { Router } from "express";
import { listByBusiness, createRecord, updateRecord, deleteRecord } from "../../shared/repository.js";
import { ScopedRequest } from "../../shared/business-scope.js";

export const contactsRouter = Router();

contactsRouter.get("/", async (req, res) => {
  const rows = await listByBusiness("contacts", (req as ScopedRequest).businessId);
  res.json(rows);
});

contactsRouter.post("/", async (req, res) => {
  const created = await createRecord("contacts", (req as ScopedRequest).businessId, req.body);
  res.status(201).json(created);
});

contactsRouter.patch("/:id", async (req, res) => {
  const updated = await updateRecord("contacts", req.params.id, (req as unknown as ScopedRequest).businessId, req.body);
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

contactsRouter.delete("/:id", async (req, res) => {
  const deleted = await deleteRecord("contacts", req.params.id, (req as unknown as ScopedRequest).businessId);
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
});
