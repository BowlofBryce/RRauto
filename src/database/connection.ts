import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";

const key = serviceRoleKey || anonKey;

if (!supabaseUrl || !key) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY");
}

const supabase: SupabaseClient = createClient(supabaseUrl, key, {
  auth: { persistSession: false }
});

function interpolate(sql: string, params: unknown[]): string {
  if (params.length === 0) return sql;
  let i = 0;
  return sql.replace(/\$\d+/g, () => {
    const val = params[i++];
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") return String(val);
    return `'${String(val).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
  });
}

export const db = {
  async query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params: unknown[] = []
  ): Promise<{ rows: T[] }> {
    const sql = interpolate(text, params);
    const { data, error } = await (supabase.rpc as Function)("execute_sql", { query: sql });
    if (error) throw new Error(`DB error: ${error.message}\nSQL: ${sql}`);
    return { rows: (data as T[]) ?? [] };
  },

  close(): Promise<void> {
    return Promise.resolve();
  }
};
