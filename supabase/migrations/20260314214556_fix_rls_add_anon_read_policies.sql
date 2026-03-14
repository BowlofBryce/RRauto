/*
  # Fix RLS — add anon read policies for all CRM tables

  The frontend uses the anon key. Previous policies only allowed service_role.
  This migration adds SELECT policies for the anon role so the UI can load data.
  Write operations (INSERT/UPDATE/DELETE) remain open to anon for this single-tenant
  template (no auth required — businesses manage their own CRM).
*/

-- BUSINESSES
CREATE POLICY "Anon can read businesses"
  ON businesses FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert businesses"
  ON businesses FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update businesses"
  ON businesses FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- PIPELINE STAGES
CREATE POLICY "Anon can read pipeline_stages"
  ON pipeline_stages FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert pipeline_stages"
  ON pipeline_stages FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update pipeline_stages"
  ON pipeline_stages FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete pipeline_stages"
  ON pipeline_stages FOR DELETE TO anon USING (true);

-- CONTACTS
CREATE POLICY "Anon can read contacts"
  ON contacts FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert contacts"
  ON contacts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update contacts"
  ON contacts FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete contacts"
  ON contacts FOR DELETE TO anon USING (true);

-- LEADS
CREATE POLICY "Anon can read leads"
  ON leads FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert leads"
  ON leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update leads"
  ON leads FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete leads"
  ON leads FOR DELETE TO anon USING (true);

-- QUOTES
CREATE POLICY "Anon can read quotes"
  ON quotes FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert quotes"
  ON quotes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update quotes"
  ON quotes FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete quotes"
  ON quotes FOR DELETE TO anon USING (true);

-- JOBS
CREATE POLICY "Anon can read jobs"
  ON jobs FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert jobs"
  ON jobs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update jobs"
  ON jobs FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete jobs"
  ON jobs FOR DELETE TO anon USING (true);

-- COMMUNICATIONS
CREATE POLICY "Anon can read communications"
  ON communications FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert communications"
  ON communications FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update communications"
  ON communications FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- AUTOMATIONS
CREATE POLICY "Anon can read automations"
  ON automations FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert automations"
  ON automations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update automations"
  ON automations FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete automations"
  ON automations FOR DELETE TO anon USING (true);

-- AUTOMATION LOGS
CREATE POLICY "Anon can read automation_logs"
  ON automation_logs FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert automation_logs"
  ON automation_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update automation_logs"
  ON automation_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- AUTOMATION QUEUE
CREATE POLICY "Anon can read automation_queue"
  ON automation_queue FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert automation_queue"
  ON automation_queue FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update automation_queue"
  ON automation_queue FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete automation_queue"
  ON automation_queue FOR DELETE TO anon USING (true);
