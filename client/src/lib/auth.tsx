import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from './supabase'

interface AuthState {
  token: string | null
  businessId: string | null
  userEmail: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ businessId: string }>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('sb_access_token'))
  const [businessId, setBusinessId] = useState<string | null>(() => sessionStorage.getItem('sb_business_id'))
  const [userEmail, setUserEmail] = useState<string | null>(() => sessionStorage.getItem('sb_user_email'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        sessionStorage.setItem('sb_access_token', session.access_token)
        setToken(session.access_token)
        setUserEmail(session.user.email ?? null)
        sessionStorage.setItem('sb_user_email', session.user.email ?? '')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        sessionStorage.setItem('sb_access_token', session.access_token)
        setToken(session.access_token)
        setUserEmail(session.user.email ?? null)
        sessionStorage.setItem('sb_user_email', session.user.email ?? '')
      } else {
        sessionStorage.removeItem('sb_access_token')
        sessionStorage.removeItem('sb_business_id')
        sessionStorage.removeItem('sb_user_email')
        setToken(null)
        setBusinessId(null)
        setUserEmail(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const accessToken = data.session.access_token
    sessionStorage.setItem('sb_access_token', accessToken)
    setToken(accessToken)
    setUserEmail(data.user.email ?? null)
    sessionStorage.setItem('sb_user_email', data.user.email ?? '')

    const client = supabase
    const { data: rows, error: bizErr } = await client
      .from('business_users')
      .select('business_id')
      .limit(1)

    if (bizErr || !rows?.length) throw new Error('No business found for this user')

    const bid = rows[0].business_id as string
    sessionStorage.setItem('sb_business_id', bid)
    setBusinessId(bid)
    return { businessId: bid }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(() => {
    supabase.auth.signOut()
    sessionStorage.clear()
    setToken(null)
    setBusinessId(null)
    setUserEmail(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, businessId, userEmail, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
