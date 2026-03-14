import "dotenv/config";
import express from "express";
import { readFileSync } from "fs";
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

app.get("/", (_req, res) => {
  res.redirect("/login");
});

app.get("/login", (_req, res) => {
  const html = readFileSync(join(__dirname, "public/login.html"), "utf8")
    .replace("__SUPABASE_URL__", process.env.VITE_SUPABASE_URL ?? "")
    .replace("__SUPABASE_ANON_KEY__", process.env.VITE_SUPABASE_ANON_KEY ?? "");
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

app.get("/dashboard", (_req, res) => {
  const html = readFileSync(join(__dirname, "public/dashboard.html"), "utf8");
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

app.use(withAuthOrBusinessScope);

app.use("/contacts", contactsRouter);
app.use("/leads", leadsRouter);
app.use("/jobs", jobsRouter);
app.use("/quotes", quotesRouter);
app.use("/communications", communicationsRouter);
app.use("/automations", automationsRouter);
app.use("/pipeline", pipelineRouter);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error", detail: error.message });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`CRM API listening on :${port}`);
});
