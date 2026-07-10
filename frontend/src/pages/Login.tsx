import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'ADMIN_FHT' ? '/admin' : '/clube', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'font-body bg-night/60 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250 w-full'

  return (
    <div className="min-h-screen bg-[#070D1E] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-federation/20 border border-federation/40 rounded-xl mb-4">
            <span className="font-display text-gold text-2xl">FHT</span>
          </div>
          <h1 className="font-display text-fht-white text-3xl leading-none">ÁREA RESTRITA</h1>
          <p className="font-body text-gray-soft text-sm mt-1">Federação de Handebol do Tocantins</p>
        </div>

        <div className="bg-night/60 border border-federation/20 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">E-mail</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" className={inp} autoComplete="email" />
            </div>
            <div>
              <label className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Senha</label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className={`${inp} pr-12`} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-soft hover:text-gold transition-colors duration-250">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="font-body text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="font-display text-night bg-gold hover:bg-gold-light py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>
        </div>

        <p className="font-body text-gray-soft text-xs text-center mt-6">
          <a href="/" className="hover:text-gold transition-colors duration-250">← Voltar ao site</a>
        </p>
      </div>
    </div>
  )
}
