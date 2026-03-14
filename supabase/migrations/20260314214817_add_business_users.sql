/*
  # Add Business Users Table

  ## Overview
  Links Supabase auth users to businesses, enabling sign-in to automatically
  scope API requests to the correct business.

  ## New Tables
  1. `business_users` - Maps auth.users to businesses
     - `user_id` (uuid) - references auth.users
     - `business_id` (uuid) - references businesses
     - `role` (text) - 'owner' | 'member'
     - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Authenticated users can only read their own membership rows
  - Service role has full access for seeding and admin use

  ## Notes
  - Composite primary key (user_id, business_id) prevents duplicates
  - Used by the sign-in flow to resolve which business_id to scope API calls to
*/

CREATE TABLE IF NOT EXISTS business_users (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, business_id)
);

CREATE INDEX IF NOT EXISTS idx_business_users_user ON business_users (user_id);

ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own business memberships"
  ON business_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to business_users"
  ON business_users FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert business_users"
  ON business_users FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update business_users"
  ON business_users FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete business_users"
  ON business_users FOR DELETE TO service_role USING (true);
