/*
  # Fix execute_sql function causing auth 500 errors

  1. Changes
    - Set search_path on execute_sql SECURITY DEFINER function to prevent
      Supabase auth "Database error querying schema" failures
    - Revoke anon access to execute_sql (critical security fix -- anon
      should never run arbitrary SQL)

  2. Security
    - SECURITY DEFINER functions without a locked search_path can corrupt
      schema resolution for Supabase's internal auth queries
    - The anon role having EXECUTE on arbitrary-SQL function is a severe
      vulnerability
*/

ALTER FUNCTION public.execute_sql(text) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.execute_sql(text) FROM anon;
