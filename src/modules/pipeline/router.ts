import { Router } from "express";
import { listPipelineStages, upsertPipelineStages } from "../../core/pipeline/service.js";
import { ScopedRequest } from "../../shared/business-scope.js";

export const pipelineRouter = Router();

pipelineRouter.get("/", async (req, res) => {
  const stages = await listPipelineStages((req as ScopedRequest).businessId);
  res.json(stages);
});

pipelineRouter.put("/", async (req, res) => {
  const stages = await upsertPipelineStages((req as ScopedRequest).businessId, req.body.stages ?? []);
  res.json(stages);
});
