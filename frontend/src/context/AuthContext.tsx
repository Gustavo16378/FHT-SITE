import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN_FHT' | 'ADMIN_CLUBE'
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  role: AuthUser['role'] | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const MOCK_USERS = [
  { email: 'admin@fht.com.br', password: '123456', sub: '1', name: 'Administrador FHT', role: 'ADMIN_FHT' as const },
  { email: 'clube@fht.com.br', password: '123456', sub: '2', name: 'Palmares Handebol Clube', role: 'ADMIN_CLUBE' as const },
]

function makeMockToken(payload: object) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.mock`
}

function parseJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.sub, name: payload.name, email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, role: null, loading: true })

  useEffect(() => {
    const token = localStorage.getItem('fht_token')
    if (token) {
      const user = parseJwt(token)
      setState({ user, token, role: user?.role ?? null, loading: false })
    } else {
      setState(p => ({ ...p, loading: false }))
    }
  }, [])

  async function login(email: string, password: string) {
    const mock = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (mock) {
      const { password: _pw, ...payload } = mock
      void _pw
      const token = makeMockToken(payload)
      localStorage.setItem('fht_token', token)
      const user = parseJwt(token)
      setState({ user, token, role: user?.role ?? null, loading: false })
      return
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error(payload.message || 'Credenciais inválidas')
    }
    const { token } = await res.json()
    localStorage.setItem('fht_token', token)
    const user = parseJwt(token)
    setState({ user, token, role: user?.role ?? null, loading: false })
  }

  function logout() {
    localStorage.removeItem('fht_token')
    setState({ user: null, token: null, role: null, loading: false })
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function ProtectedRoute({ role, children }: { role: AuthUser['role']; children: ReactNode }) {
  const { token, role: userRole, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#070D1E] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!token || userRole !== role) return <Navigate to="/login" replace />
  return <>{children}</>
}
