import { useState, useEffect, useCallback } from 'react'
import { db } from '../lib/admin-api'

interface UseAdminDataResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useAdminData<T>(table: string, options?: {
  select?: string
  order?: { column: string; ascending?: boolean }
  filters?: { column: string; op: string; value: unknown }[]
  limit?: number
}): UseAdminDataResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    db.query<T>(table, options)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [table, JSON.stringify(options)])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}
