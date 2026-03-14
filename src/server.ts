import "dotenv/config";
import express from "express";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { withAuthOrBusinessScope } from "./shared/auth-middleware.js";
import { contactsRouter } from "./modules/contacts/router.js";
import { leadsRouter } from "./modules/leads/router.js";
import { jobsRouter } from "./modules/jobs/router.js";
import { quotesRouter } from "./modules/quotes/router.js";
import { communicationsRouter } from "./modules/communications/router.js";
import { automationsRouter } from "./modules/automations/router.js";
import { pipelineRouter } from "./modules/pipeline/router.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(withAuthOrBusinessScope);

app.use("/contacts", contactsRouter);
app.use("/leads", leadsRouter);
app.use("/jobs", jobsRouter);
app.use("/quotes", quotesRouter);
app.use("/communications", communicationsRouter);
app.use("/automations", automationsRouter);
app.use("/pipeline", pipelineRouter);

const clientDist = join(__dirname, "../dist-client");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error", detail: error.message });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`CRM API listening on :${port}`);
});
