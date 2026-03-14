import express from "express";
import { withBusinessScope } from "./shared/business-scope.js";
import { contactsRouter } from "./modules/contacts/router.js";
import { leadsRouter } from "./modules/leads/router.js";
import { jobsRouter } from "./modules/jobs/router.js";
import { quotesRouter } from "./modules/quotes/router.js";
import { communicationsRouter } from "./modules/communications/router.js";
import { automationsRouter } from "./modules/automations/router.js";
import { pipelineRouter } from "./modules/pipeline/router.js";

const app = express();
app.use(express.json());
app.use(withBusinessScope);

app.use("/contacts", contactsRouter);
app.use("/leads", leadsRouter);
app.use("/jobs", jobsRouter);
app.use("/quotes", quotesRouter);
app.use("/communications", communicationsRouter);
app.use("/automations", automationsRouter);
app.use("/pipeline", pipelineRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error", detail: error.message });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`CRM API listening on :${port}`);
});
