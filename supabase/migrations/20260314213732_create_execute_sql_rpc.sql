/*
  # Create execute_sql RPC function

  Provides a raw SQL execution function callable from the Supabase JS client
  using the service role. This allows the Express CRM server to run arbitrary
  SQL queries through the Supabase JS client instead of requiring a direct
  pg connection with a known password.

  - Function is SECURITY DEFINER so it runs as the owner (postgres)
  - Restricted to service_role only via GRANT
  - Returns results as JSONB array
*/

CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || query || ') t' INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION execute_sql(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION execute_sql(text) FROM anon;
REVOKE ALL ON FUNCTION execute_sql(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;
