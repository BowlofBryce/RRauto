/*
  # Admin Platform Schema

  1. New Tables
    - `platform_modules` - Registry of all available platform modules
      - `id` (text, pk) - module slug (e.g., 'contacts', 'leads', 'pipeline')
      - `name` (text) - display name
      - `description` (text) - plain-language description
      - `category` (text) - grouping (core, sales, operations, marketing, analytics)
      - `icon` (text) - lucide icon name
      - `is_default` (boolean) - enabled by default for new businesses
      - `depends_on` (text[]) - module IDs this depends on
      - `sort_order` (integer) - display ordering
      - `created_at` (timestamptz)

    - `business_modules` - Which modules are enabled per business
      - `business_id` (uuid, fk)
      - `module_id` (text, fk)
      - `enabled` (boolean)
      - `enabled_at` (timestamptz)
      - Composite PK: (business_id, module_id)

    - `feature_flags` - Platform feature flags
      - `id` (text, pk) - flag key (e.g., 'quotes.digital_signature')
      - `name` (text) - display name
      - `description` (text)
      - `module_id` (text, fk, nullable) - tied to a module
      - `is_global` (boolean) - applies to all businesses
      - `default_enabled` (boolean) - default state
      - `created_at` (timestamptz)

    - `business_feature_flags` - Per-business flag overrides
      - `business_id` (uuid, fk)
      - `flag_id` (text, fk)
      - `enabled` (boolean)
      - Composite PK: (business_id, flag_id)

    - `presets` - Reusable deployment presets
      - `id` (uuid, pk)
      - `slug` (text, unique) - e.g., 'landscaping', 'essential'
      - `name` (text)
      - `description` (text)
      - `category` (text) - 'industry' or 'plan'
      - `config` (jsonb) - modules, automations, pipeline stages, service types, etc.
      - `is_active` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)

    - `messaging_templates` - SMS/email templates
      - `id` (uuid, pk)
      - `business_id` (uuid, fk, nullable) - null = platform default
      - `name` (text)
      - `channel` (text) - 'sms' or 'email'
      - `trigger` (text) - which automation trigger
      - `subject` (text, nullable) - for email
      - `body` (text)
      - `is_default` (boolean)
      - `created_at` (timestamptz)

    - `custom_fields` - Per-business custom fields
      - `id` (uuid, pk)
      - `business_id` (uuid, fk)
      - `entity` (text) - 'contact', 'lead', 'job', 'quote'
      - `field_name` (text)
      - `field_type` (text) - 'text', 'number', 'date', 'select', 'boolean'
      - `options` (jsonb, nullable) - for select type
      - `is_required` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)

    - `audit_logs` - Platform audit trail
      - `id` (uuid, pk)
      - `actor_id` (uuid, nullable) - user who performed action
      - `business_id` (uuid, fk, nullable) - affected business
      - `action` (text) - e.g., 'business.created', 'module.enabled'
      - `entity_type` (text, nullable) - 'business', 'module', 'automation'
      - `entity_id` (text, nullable)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. Extended Tables
    - `businesses` gets new columns:
      - `status` (text) - 'active', 'onboarding', 'suspended', 'archived'
      - `plan` (text) - 'essential', 'growth', 'pro'
      - `preset_id` (uuid, fk, nullable) - which preset was used
      - `branding` (jsonb) - logo, colors, etc.
      - `onboarding_step` (integer) - provisioning progress

  3. Security
    - All tables have RLS enabled
    - Service role has full access
    - Admin users checked via business_users role = 'admin' or special admin flag
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'status'
  ) THEN
    ALTER TABLE businesses ADD COLUMN status text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'plan'
  ) THEN
    ALTER TABLE businesses ADD COLUMN plan text DEFAULT 'essential';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'preset_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN preset_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'branding'
  ) THEN
    ALTER TABLE businesses ADD COLUMN branding jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'onboarding_step'
  ) THEN
    ALTER TABLE businesses ADD COLUMN onboarding_step integer DEFAULT 0;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS platform_modules (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'core',
  icon text DEFAULT 'box',
  is_default boolean DEFAULT false,
  depends_on text[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE platform_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_platform_modules" ON platform_modules FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS business_modules (
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  module_id text REFERENCES platform_modules(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  enabled_at timestamptz DEFAULT now(),
  PRIMARY KEY (business_id, module_id)
);
ALTER TABLE business_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_business_modules" ON business_modules FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS feature_flags (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  module_id text REFERENCES platform_modules(id) ON DELETE SET NULL,
  is_global boolean DEFAULT false,
  default_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_feature_flags" ON feature_flags FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS business_feature_flags (
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  flag_id text REFERENCES feature_flags(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false,
  PRIMARY KEY (business_id, flag_id)
);
ALTER TABLE business_feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_business_feature_flags" ON business_feature_flags FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'industry',
  config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_presets" ON presets FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS messaging_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  channel text NOT NULL DEFAULT 'sms',
  trigger text DEFAULT '',
  subject text,
  body text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messaging_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_messaging_templates" ON messaging_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  entity text NOT NULL DEFAULT 'contact',
  field_name text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  options jsonb,
  is_required boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_custom_fields" ON custom_fields FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_audit_logs" ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_business_modules_business ON business_modules(business_id);
CREATE INDEX IF NOT EXISTS idx_business_feature_flags_business ON business_feature_flags(business_id);
CREATE INDEX IF NOT EXISTS idx_messaging_templates_business ON messaging_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_business ON custom_fields(business_id, entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business ON audit_logs(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);

INSERT INTO platform_modules (id, name, description, category, icon, is_default, sort_order) VALUES
  ('contacts', 'Contacts', 'Customer and contact management', 'core', 'users', true, 1),
  ('leads', 'Leads', 'Lead tracking and qualification', 'sales', 'target', true, 2),
  ('pipeline', 'Pipeline', 'Visual sales pipeline with stages', 'sales', 'kanban', true, 3),
  ('quotes', 'Quotes', 'Quote creation and tracking', 'sales', 'file-text', true, 4),
  ('jobs', 'Jobs', 'Job scheduling and management', 'operations', 'briefcase', true, 5),
  ('calendar', 'Calendar', 'Schedule and appointment views', 'operations', 'calendar', true, 6),
  ('communications', 'Communications', 'SMS and email history', 'marketing', 'message-square', true, 7),
  ('automations', 'Automations', 'Automated workflows and triggers', 'marketing', 'zap', true, 8),
  ('reviews', 'Reviews', 'Review requests and follow-up', 'marketing', 'star', false, 9),
  ('reporting', 'Reporting', 'Business analytics and metrics', 'analytics', 'bar-chart-3', false, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO presets (slug, name, description, category, config, sort_order) VALUES
  ('landscaping', 'Landscaping', 'For lawn care and landscaping businesses', 'industry', '{"modules":["contacts","leads","pipeline","quotes","jobs","calendar","communications","automations","reviews"],"service_types":["Lawn Mowing","Landscaping","Tree Trimming","Leaf Cleanup","Garden Design","Irrigation"],"pipeline_stages":["New Lead","Estimate Scheduled","Estimate Sent","Negotiation","Won"]}', 1),
  ('pressure-washing', 'Pressure Washing', 'For pressure washing businesses', 'industry', '{"modules":["contacts","leads","pipeline","quotes","jobs","calendar","communications","automations","reviews"],"service_types":["House Wash","Driveway","Deck","Patio","Roof Wash","Commercial"],"pipeline_stages":["New Lead","Quote Sent","Follow Up","Booked","Completed"]}', 2),
  ('window-cleaning', 'Window Cleaning', 'For window cleaning businesses', 'industry', '{"modules":["contacts","leads","pipeline","quotes","jobs","calendar","communications","automations"],"service_types":["Interior Windows","Exterior Windows","Screen Cleaning","Track Cleaning","Commercial Windows"],"pipeline_stages":["New Lead","Quoted","Scheduled","Completed"]}', 3),
  ('essential', 'Essential Plan', 'Basic CRM features for getting started', 'plan', '{"modules":["contacts","leads","pipeline","jobs","communications"],"max_contacts":500,"max_automations":3}', 10),
  ('growth', 'Growth Plan', 'Full CRM with automations and quotes', 'plan', '{"modules":["contacts","leads","pipeline","quotes","jobs","calendar","communications","automations"],"max_contacts":2500,"max_automations":10}', 11),
  ('pro', 'Pro Plan', 'Everything plus analytics, reviews, and unlimited', 'plan', '{"modules":["contacts","leads","pipeline","quotes","jobs","calendar","communications","automations","reviews","reporting"],"max_contacts":-1,"max_automations":-1}', 12)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO feature_flags (id, name, description, module_id, is_global, default_enabled) VALUES
  ('contacts.import_csv', 'CSV Import', 'Allow importing contacts from CSV files', 'contacts', false, false),
  ('contacts.custom_fields', 'Custom Fields', 'Enable custom fields on contacts', 'contacts', false, false),
  ('leads.auto_assignment', 'Auto Assignment', 'Automatically assign leads to team members', 'leads', false, false),
  ('quotes.digital_signature', 'Digital Signatures', 'Allow customers to sign quotes digitally', 'quotes', false, false),
  ('quotes.online_payment', 'Online Payment', 'Accept payments through quotes', 'quotes', false, false),
  ('jobs.recurring', 'Recurring Jobs', 'Schedule recurring/repeating jobs', 'jobs', false, false),
  ('automations.advanced_conditions', 'Advanced Conditions', 'Complex automation trigger conditions', 'automations', false, false),
  ('communications.whatsapp', 'WhatsApp', 'Send messages via WhatsApp', 'communications', false, false),
  ('platform.white_label', 'White Label', 'Remove platform branding', NULL, false, false),
  ('platform.api_access', 'API Access', 'Enable external API access', NULL, false, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO messaging_templates (name, channel, trigger, body, is_default) VALUES
  ('New Lead Response', 'sms', 'lead_created', 'Hi {{contact_name}}, thanks for reaching out! We''ll get back to you shortly.', true),
  ('Quote Follow-Up', 'sms', 'quote_sent', 'Hi {{contact_name}}, just following up on the quote we sent. Any questions?', true),
  ('Appointment Reminder', 'sms', 'job_scheduled', 'Reminder: Your appointment is coming up. See you soon!', true),
  ('Review Request', 'sms', 'job_completed', 'Hi {{contact_name}}, thanks for choosing us! Would you leave us a review?', true),
  ('Missed Call', 'sms', 'missed_call', 'Hi {{contact_name}}, sorry we missed your call. How can we help?', true),
  ('Reactivation', 'email', 'customer_inactive', 'Hi {{contact_name}}, it''s been a while! We''d love to help you again.', true)
ON CONFLICT DO NOTHING;
