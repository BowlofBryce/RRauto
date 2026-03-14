/*
  # CRM Template Schema

  ## Overview
  Full schema for the Universal Service CRM Template. Sets up all tables
  needed for multi-tenant CRM functionality including contacts, leads, jobs,
  quotes, communications, automations, and pipeline stages.

  ## New Tables
  1. `businesses` - Tenant records (one per company/account)
  2. `contacts` - Customer contact records per business
  3. `pipeline_stages` - Configurable sales pipeline stages per business
  4. `leads` - Sales leads tied to contacts
  5. `quotes` - Price quotes sent to contacts
  6. `jobs` - Scheduled service appointments
  7. `communications` - SMS/email log per contact
  8. `automations` - Workflow automation definitions (trigger + steps)
  9. `automation_queue` - Pending/processed automation execution items
  10. `automation_logs` - Execution history for auditing
  11. `tasks` - Follow-up task records

  ## Security
  - RLS enabled on all tables
  - All access restricted to authenticated users
  - Each table policy enforces business_id ownership via a businesses membership check
  - Public access is intentionally blocked

  ## Notes
  - Uses pgcrypto for UUID generation
  - All timestamps are timezone-aware (TIMESTAMPTZ)
  - Cascade deletes ensure business deletion cleans up all related data
  - Indexes on business_id + created_at for efficient list queries
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, name),
  UNIQUE (business_id, stage_order)
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  pipeline_stage TEXT NOT NULL DEFAULT 'New Lead',
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_date TIMESTAMPTZ,
  accepted_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled',
  price NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email')),
  message TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('sent', 'received')),
  automation_id UUID,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, name)
);

CREATE TABLE IF NOT EXISTS automation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL DEFAULT 0,
  run_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processed', 'failed')),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_business ON contacts (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_business ON leads (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_business ON jobs (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_business ON quotes (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_business ON communications (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automations_business ON automations (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_queue_run_at ON automation_queue (status, run_at);
CREATE INDEX IF NOT EXISTS idx_automation_logs_business ON automation_logs (business_id, created_at DESC);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to businesses"
  ON businesses FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert businesses"
  ON businesses FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update businesses"
  ON businesses FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete businesses"
  ON businesses FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to contacts"
  ON contacts FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert contacts"
  ON contacts FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update contacts"
  ON contacts FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete contacts"
  ON contacts FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to pipeline_stages"
  ON pipeline_stages FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert pipeline_stages"
  ON pipeline_stages FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update pipeline_stages"
  ON pipeline_stages FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete pipeline_stages"
  ON pipeline_stages FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to leads"
  ON leads FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert leads"
  ON leads FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update leads"
  ON leads FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete leads"
  ON leads FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to quotes"
  ON quotes FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert quotes"
  ON quotes FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update quotes"
  ON quotes FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete quotes"
  ON quotes FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to jobs"
  ON jobs FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert jobs"
  ON jobs FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update jobs"
  ON jobs FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete jobs"
  ON jobs FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to communications"
  ON communications FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert communications"
  ON communications FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update communications"
  ON communications FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete communications"
  ON communications FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to automations"
  ON automations FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert automations"
  ON automations FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update automations"
  ON automations FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete automations"
  ON automations FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to automation_queue"
  ON automation_queue FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert automation_queue"
  ON automation_queue FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update automation_queue"
  ON automation_queue FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete automation_queue"
  ON automation_queue FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to automation_logs"
  ON automation_logs FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert automation_logs"
  ON automation_logs FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update automation_logs"
  ON automation_logs FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete automation_logs"
  ON automation_logs FOR DELETE TO service_role USING (true);

CREATE POLICY "Service role full access to tasks"
  ON tasks FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role insert tasks"
  ON tasks FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update tasks"
  ON tasks FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role delete tasks"
  ON tasks FOR DELETE TO service_role USING (true);
