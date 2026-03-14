import { Router } from "express";
import { listByBusiness, createRecord } from "../../shared/repository.js";
import { ScopedRequest } from "../../shared/business-scope.js";

export const communicationsRouter = Router();

communicationsRouter.get("/", async (req, res) => {
  const rows = await listByBusiness("communications", (req as ScopedRequest).businessId);
  res.json(rows);
});

communicationsRouter.post("/", async (req, res) => {
  const created = await createRecord("communications", (req as ScopedRequest).businessId, req.body);
  res.status(201).json(created);
});
