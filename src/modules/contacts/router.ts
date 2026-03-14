import { Router } from "express";
import { listByBusiness, createRecord } from "../../shared/repository.js";
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
