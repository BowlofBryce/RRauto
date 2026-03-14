import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

interface UseDataResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useData<T>(path: string): UseDataResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    api.get<T[]>(path)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [path])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}
