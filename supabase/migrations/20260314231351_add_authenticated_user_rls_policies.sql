/*
  # Add authenticated user RLS policies for all data tables

  1. Changes
    - Add SELECT, INSERT, UPDATE, DELETE policies for authenticated users
      on all CRM data tables, scoped by business membership
    - Users can only access rows where business_id matches a business
      they belong to (via business_users table)

  2. Tables affected
    - contacts, leads, quotes, jobs, communications
    - automations, automation_queue, automation_logs
    - tasks, pipeline_stages, businesses

  3. Security
    - All policies check authenticated role
    - All policies verify business membership via business_users lookup
    - Businesses table: users can only read businesses they belong to
*/

CREATE OR REPLACE FUNCTION public.user_business_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id FROM business_users WHERE user_id = auth.uid();
$$;

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'contacts','leads','quotes','jobs','communications',
      'automations','automation_queue','automation_logs',
      'tasks','pipeline_stages'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY "Authenticated users can select own business %1$s"
        ON public.%1$I FOR SELECT TO authenticated
        USING (business_id IN (SELECT public.user_business_ids()))',
      tbl
    );

    EXECUTE format(
      'CREATE POLICY "Authenticated users can insert own business %1$s"
        ON public.%1$I FOR INSERT TO authenticated
        WITH CHECK (business_id IN (SELECT public.user_business_ids()))',
      tbl
    );

    EXECUTE format(
      'CREATE POLICY "Authenticated users can update own business %1$s"
        ON public.%1$I FOR UPDATE TO authenticated
        USING (business_id IN (SELECT public.user_business_ids()))
        WITH CHECK (business_id IN (SELECT public.user_business_ids()))',
      tbl
    );

    EXECUTE format(
      'CREATE POLICY "Authenticated users can delete own business %1$s"
        ON public.%1$I FOR DELETE TO authenticated
        USING (business_id IN (SELECT public.user_business_ids()))',
      tbl
    );
  END LOOP;
END $$;

CREATE POLICY "Authenticated users can read own businesses"
  ON public.businesses FOR SELECT TO authenticated
  USING (id IN (SELECT public.user_business_ids()));
