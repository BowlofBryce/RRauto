import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Business } from '../types/crm.types'

interface Ctx {
  business: Business | null
  loading: boolean
  setBusiness: (b: Business) => void
}

const BusinessContext = createContext<Ctx>({ business: null, loading: true, setBusiness: () => {} })

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('businesses')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setBusiness(data as Business)
        setLoading(false)
      })
  }, [])

  return (
    <BusinessContext.Provider value={{ business, loading, setBusiness }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() { return useContext(BusinessContext) }
