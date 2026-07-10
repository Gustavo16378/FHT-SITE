import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { API_URL, ApiError } from '../services/api'

interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN_FHT' | 'ADMIN_CLUBE'
  clubeId?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  role: AuthUser['role'] | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Fallback APENAS para desenvolvimento offline (backend fora do ar).
// Com o backend rodando, o login real sempre prevalece.
const MOCK_USERS = [
  { email: 'admin@fht.org.br', password: '123456', sub: '1', name: 'Administrador FHT', role: 'ADMIN_FHT' as const },
  { email: 'clube@fht.org.br', password: '123456', sub: '2', name: 'Palmares Handebol Clube', role: 'ADMIN_CLUBE' as const },
]

function makeMockToken(payload: object) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.mock`
}

// Decodifica o payload de um JWT (base64url + UTF-8). Funciona tanto para o
// token real do backend quanto para o mock.
function parseJwt(token: string): AuthUser | null {
  try {
    const part = token.split('.')[1]
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    const payload = JSON.parse(json)
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.upn ?? payload.email,
      role: payload.role,
      clubeId: payload.clubeId,
    }
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
      if (user) setState({ user, token, role: user.role, loading: false })
      else {
        localStorage.removeItem('fht_token')
        setState({ user: null, token: null, role: null, loading: false })
      }
    } else {
      setState(p => ({ ...p, loading: false }))
    }
  }, [])

  function applyToken(token: string): AuthUser {
    const user = parseJwt(token)
    if (!user) throw new ApiError('Token inválido recebido do servidor', 500)
    localStorage.setItem('fht_token', token)
    setState({ user, token, role: user.role, loading: false })
    return user
  }

  function loginMock(email: string, password: string): AuthUser {
    const mock = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!mock) throw new Error('Servidor indisponível. Tente novamente em instantes.')
    const { password: _pw, ...payload } = mock
    void _pw
    return applyToken(makeMockToken(payload))
  }

  async function login(email: string, password: string): Promise<AuthUser> {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new ApiError(body?.message || 'Credenciais inválidas', res.status)
      }
      const body = await res.json()
      const token: string | undefined = body?.data?.token
      if (!token) throw new ApiError('Resposta de login inválida', 500)
      return applyToken(token)
    } catch (err) {
      // Erro de credenciais/servidor (ApiError) → propaga.
      // Erro de rede (backend fora do ar) → tenta o mock offline.
      if (err instanceof ApiError) throw err
      return loginMock(email, password)
    }
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
