import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Loader as Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
        setError('')
        setIsSignUp(false)
        alert('Account created. You can now sign in.')
      } else {
        await signIn(email, password)
        navigate('/')
      }
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#0f62fe',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Briefcase size={20} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: '#18181b' }}>
            ServiceOS
          </h1>
          <p style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>
            {isSignUp ? 'Create your account' : 'Sign in to your workspace'}
          </p>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #e4e4e7',
          borderRadius: 10,
          padding: 24,
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#52525b' }}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '7px 10px',
                  fontSize: 14,
                  border: '1px solid #e4e4e7',
                  borderRadius: 6,
                  outline: 'none',
                  background: '#fafafa',
                  transition: 'border-color 120ms ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0f62fe' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e4e4e7' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#52525b' }}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  padding: '7px 10px',
                  fontSize: 14,
                  border: '1px solid #e4e4e7',
                  borderRadius: 6,
                  outline: 'none',
                  background: '#fafafa',
                  transition: 'border-color 120ms ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0f62fe' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e4e4e7' }}
              />
            </label>

            {error && (
              <div style={{
                padding: '8px 10px',
                background: '#fff1f1',
                color: '#da1e28',
                fontSize: 12.5,
                borderRadius: 6,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 500,
                background: '#0f62fe',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 4,
                fontFamily: 'inherit',
                transition: 'opacity 120ms ease',
              }}
            >
              {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12.5,
                color: '#0f62fe',
                fontFamily: 'inherit',
              }}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  )
}
