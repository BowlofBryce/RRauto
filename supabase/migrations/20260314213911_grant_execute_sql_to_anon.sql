/*
  # Grant execute_sql to anon role
  
  The CRM server uses the anon key from .env to connect via Supabase JS client.
  This grants the anon role permission to call execute_sql so all DB queries work.
  The function itself runs as SECURITY DEFINER (postgres) so it has full access.
*/
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;
