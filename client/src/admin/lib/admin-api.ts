import { supabase } from '@/lib/supabase'

export const db = {
  from: (table: string) => supabase.from(table),

  async query<T>(table: string, options?: {
    select?: string
    order?: { column: string; ascending?: boolean }
    filters?: { column: string; op: string; value: unknown }[]
    limit?: number
  }): Promise<T[]> {
    let q = supabase.from(table).select(options?.select ?? '*')
    if (options?.filters) {
      for (const f of options.filters) {
        q = q.filter(f.column, f.op, f.value)
      }
    }
    if (options?.order) {
      q = q.order(options.order.column, { ascending: options.order.ascending ?? false })
    }
    if (options?.limit) {
      q = q.limit(options.limit)
    }
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as T[]
  },

  async insert<T>(table: string, payload: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.from(table).insert(payload).select().single()
    if (error) throw error
    return data as T
  },

  async update<T>(table: string, id: string, payload: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as T
  },

  async upsert<T>(table: string, payload: Record<string, unknown>, onConflict: string): Promise<T> {
    const { data, error } = await supabase.from(table).upsert(payload, { onConflict }).select().single()
    if (error) throw error
    return data as T
  },

  async remove(table: string, id: string): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
  },

  async count(table: string, filters?: { column: string; op: string; value: unknown }[]): Promise<number> {
    let q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (filters) {
      for (const f of filters) {
        q = q.filter(f.column, f.op, f.value)
      }
    }
    const { count, error } = await q
    if (error) throw error
    return count ?? 0
  },
}
