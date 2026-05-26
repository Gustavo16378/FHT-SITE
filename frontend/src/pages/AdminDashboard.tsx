import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Shield, Users, Star, Trophy, Newspaper,
  FileText, LogOut, Menu, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/* ── tipos ────────────────────────────────────────────────── */
type Page = 'dashboard' | 'clubes' | 'atletas' | 'arbitros' | 'competicoes' | 'noticias' | 'documentos'

type StatusClube = 'PENDENTE' | 'ATIVO' | 'REJEITADO'
type StatusAtleta = 'AGUARDANDO_PAGAMENTO' | 'ATIVO' | 'REJEITADO'
type StatusArbitro = 'PENDENTE' | 'CREDENCIADO' | 'REJEITADO'

interface Clube {
  id: number; nome: string; cidade: string; representante: string
  status: StatusClube; data: string
}
interface Atleta {
  id: number; nome: string; clube: string; posicao: string
  categoria: string; status: StatusAtleta; comprovanteUrl: string
}
interface Arbitro {
  id: number; nome: string; cidade: string; nivel: string; status: StatusArbitro
}

/* ── mock data ────────────────────────────────────────────── */
const clubesMock: Clube[] = [
  { id: 1, nome: 'Palmas HC', cidade: 'Palmas/TO', representante: 'João Silva', status: 'PENDENTE', data: '12/05/2026' },
  { id: 2, nome: 'Araguaína Handebol', cidade: 'Araguaína/TO', representante: 'Maria Costa', status: 'ATIVO', data: '03/04/2026' },
  { id: 3, nome: 'Gurupi Handebol Clube', cidade: 'Gurupi/TO', representante: 'Pedro Lima', status: 'REJEITADO', data: '20/03/2026' },
]
const atletasMock: Atleta[] = [
  { id: 1, nome: 'Carlos Eduardo', clube: 'Palmas HC', posicao: 'Goleiro', categoria: 'Adulto', status: 'AGUARDANDO_PAGAMENTO', comprovanteUrl: '#' },
  { id: 2, nome: 'Ana Beatriz Souza', clube: 'Araguaína Handebol', posicao: 'Ponta Direita', categoria: 'Sub-18', status: 'ATIVO', comprovanteUrl: '#' },
]
const arbitrosMock: Arbitro[] = [
  { id: 1, nome: 'Fábio Martins', cidade: 'Palmas/TO', nivel: '', status: 'PENDENTE' },
  { id: 2, nome: 'Renata Alves', cidade: 'Porto Nacional/TO', nivel: 'Estadual B', status: 'CREDENCIADO' },
]

/* ── badge helpers ────────────────────────────────────────── */
const clubeBadge: Record<StatusClube, string> = {
  PENDENTE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  ATIVO: 'text-green-400 bg-green-500/10 border-green-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
}
const atletaBadge: Record<StatusAtleta, string> = {
  AGUARDANDO_PAGAMENTO: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  ATIVO: 'text-green-400 bg-green-500/10 border-green-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
}
const arbitroBadge: Record<StatusArbitro, string> = {
  PENDENTE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  CREDENCIADO: 'text-green-400 bg-green-500/10 border-green-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
}

/* ── helpers estilo ────────────────────────────────────────── */
const inp = 'font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250 w-full'
const sel = `${inp} appearance-none cursor-pointer`

/* ── Modal de confirmação genérico ────────────────────────── */
function ConfirmModal({
  title, message, confirmLabel, confirmClass, children, onConfirm, onClose,
}: {
  title: string; message: string; confirmLabel: string; confirmClass: string
  children?: React.ReactNode; onConfirm: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="bg-[#0d1b2a] border border-federation/30 rounded-xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-federation/20">
          <h3 className="font-display text-fht-white text-xl">{title}</h3>
          <button onClick={onClose} className="text-gray-soft hover:text-gold transition-colors duration-250"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="font-body text-gray-soft text-sm">{message}</p>
          {children}
          <div className="flex gap-3 mt-2">
            <button onClick={onClose}
              className="flex-1 font-display text-gray-soft border border-federation/30 hover:border-federation/60 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
              CANCELAR
            </button>
            <button onClick={onConfirm} className={`flex-1 font-display py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 ${confirmClass}`}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard Page ────────────────────────────────────────── */
function DashboardPage() {
  const cards = [
    { group: 'Clubes', items: [{ label: 'Total', v: 3 }, { label: 'Ativos', v: 1 }, { label: 'Pendentes', v: 1 }], color: 'border-federation/40' },
    { group: 'Atletas', items: [{ label: 'Total', v: 2 }, { label: 'Ativos', v: 1 }, { label: 'Ag. pagamento', v: 1 }], color: 'border-gold/30' },
    { group: 'Árbitros', items: [{ label: 'Total', v: 2 }, { label: 'Credenciados', v: 1 }, { label: 'Pendentes', v: 1 }], color: 'border-blue-400/30' },
  ]
  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">DASHBOARD</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {cards.map(g => (
          <div key={g.group} className={`bg-[#0d1b2a]/60 border ${g.color} rounded-xl p-5`}>
            <p className="font-display text-gold text-base tracking-wider mb-3">{g.group.toUpperCase()}</p>
            <div className="flex gap-4">
              {g.items.map(i => (
                <div key={i.label}>
                  <p className="font-display text-fht-white text-3xl">{i.v}</p>
                  <p className="font-body text-gray-soft text-xs">{i.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Clubes Page ───────────────────────────────────────────── */
function ClubesPage() {
  const [clubes, setClubes] = useState<Clube[]>(clubesMock)
  const [modal, setModal] = useState<{ type: 'aprovar' | 'rejeitar'; id: number } | null>(null)
  const [motivo, setMotivo] = useState('')

  async function handleAprovar(id: number) {
    const token = localStorage.getItem('fht_token')
    await fetch(`${import.meta.env.VITE_API_URL}/api/clubes/${id}/aprovar`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    setClubes(p => p.map(c => c.id === id ? { ...c, status: 'ATIVO' } : c))
    setModal(null)
  }

  async function handleRejeitar(id: number) {
    const token = localStorage.getItem('fht_token')
    await fetch(`${import.meta.env.VITE_API_URL}/api/clubes/${id}/rejeitar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo }),
    }).catch(() => {})
    setClubes(p => p.map(c => c.id === id ? { ...c, status: 'REJEITADO' } : c))
    setMotivo('')
    setModal(null)
  }

  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">CLUBES</h2>
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-federation/20">
              {['Nome','Cidade','Representante','Status','Data','Ações'].map(h => (
                <th key={h} className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clubes.map(c => (
              <tr key={c.id} className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150">
                <td className="px-4 py-3 font-body text-fht-white text-sm">{c.nome}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{c.cidade}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{c.representante}</td>
                <td className="px-4 py-3">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${clubeBadge[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{c.data}</td>
                <td className="px-4 py-3">
                  {c.status === 'PENDENTE' && (
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ type: 'aprovar', id: c.id })}
                        className="font-body text-green-400 text-xs hover:underline">Aprovar</button>
                      <button onClick={() => setModal({ type: 'rejeitar', id: c.id })}
                        className="font-body text-red-400 text-xs hover:underline">Rejeitar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === 'aprovar' && (
        <ConfirmModal title="APROVAR CLUBE" message="Confirma a aprovação deste clube? Um usuário ADMIN_CLUBE será criado automaticamente."
          confirmLabel="APROVAR" confirmClass="text-night bg-green-500 hover:bg-green-400"
          onConfirm={() => handleAprovar(modal.id)} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'rejeitar' && (
        <ConfirmModal title="REJEITAR CLUBE" message="Informe o motivo da rejeição:"
          confirmLabel="REJEITAR" confirmClass="text-fht-white bg-red-500 hover:bg-red-400"
          onConfirm={() => handleRejeitar(modal.id)} onClose={() => setModal(null)}>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} placeholder="Motivo..."
            className={`${inp} resize-none`} />
        </ConfirmModal>
      )}
    </div>
  )
}

/* ── Atletas Page ──────────────────────────────────────────── */
function AtletasPage() {
  const [atletas, setAtletas] = useState<Atleta[]>(atletasMock)
  const [modal, setModal] = useState<{ type: 'aprovar' | 'rejeitar'; id: number } | null>(null)
  const [motivo, setMotivo] = useState('')

  async function handleAprovar(id: number) {
    const token = localStorage.getItem('fht_token')
    await fetch(`${import.meta.env.VITE_API_URL}/api/atletas/${id}/aprovar`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    setAtletas(p => p.map(a => a.id === id ? { ...a, status: 'ATIVO' } : a))
    setModal(null)
  }

  async function handleRejeitar(id: number) {
    const token = localStorage.getItem('fht_token')
    await fetch(`${import.meta.env.VITE_API_URL}/api/atletas/${id}/rejeitar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo }),
    }).catch(() => {})
    setAtletas(p => p.map(a => a.id === id ? { ...a, status: 'REJEITADO' } : a))
    setMotivo('')
    setModal(null)
  }

  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">ATLETAS</h2>
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-federation/20">
              {['Nome','Clube','Posição','Categoria','Status','Comprovante','Ações'].map(h => (
                <th key={h} className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {atletas.map(a => (
              <tr key={a.id} className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150">
                <td className="px-4 py-3 font-body text-fht-white text-sm">{a.nome}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.clube}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.posicao}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.categoria}</td>
                <td className="px-4 py-3">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${atletaBadge[a.status]}`}>{a.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3">
                  <a href={a.comprovanteUrl} target="_blank" rel="noopener noreferrer"
                    className="font-body text-gold text-xs hover:underline">Ver PDF</a>
                </td>
                <td className="px-4 py-3">
                  {a.status === 'AGUARDANDO_PAGAMENTO' && (
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ type: 'aprovar', id: a.id })}
                        className="font-body text-green-400 text-xs hover:underline">Aprovar</button>
                      <button onClick={() => setModal({ type: 'rejeitar', id: a.id })}
                        className="font-body text-red-400 text-xs hover:underline">Rejeitar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === 'aprovar' && (
        <ConfirmModal title="APROVAR ATLETA" message="Confirma a validação do comprovante e ativação do atleta?"
          confirmLabel="APROVAR" confirmClass="text-night bg-green-500 hover:bg-green-400"
          onConfirm={() => handleAprovar(modal.id)} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'rejeitar' && (
        <ConfirmModal title="REJEITAR ATLETA" message="Informe o motivo da rejeição:"
          confirmLabel="REJEITAR" confirmClass="text-fht-white bg-red-500 hover:bg-red-400"
          onConfirm={() => handleRejeitar(modal.id)} onClose={() => setModal(null)}>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} placeholder="Motivo..."
            className={`${inp} resize-none`} />
        </ConfirmModal>
      )}
    </div>
  )
}

/* ── Árbitros Page ─────────────────────────────────────────── */
const NIVEIS_APROVACAO = ['Regional', 'Estadual B', 'Estadual A', 'Nacional']

function ArbitrosPage() {
  const [arbitros, setArbitros] = useState<Arbitro[]>(arbitrosMock)
  const [modal, setModal] = useState<{ type: 'aprovar' | 'rejeitar'; id: number } | null>(null)
  const [nivel, setNivel] = useState('')
  const [motivo, setMotivo] = useState('')

  async function handleAprovar(id: number) {
    const token = localStorage.getItem('fht_token')
    await fetch(`${import.meta.env.VITE_API_URL}/api/arbitros/${id}/aprovar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ nivel }),
    }).catch(() => {})
    setArbitros(p => p.map(a => a.id === id ? { ...a, status: 'CREDENCIADO', nivel } : a))
    setNivel('')
    setModal(null)
  }

  async function handleRejeitar(id: number) {
    const token = localStorage.getItem('fht_token')
    await fetch(`${import.meta.env.VITE_API_URL}/api/arbitros/${id}/rejeitar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo }),
    }).catch(() => {})
    setArbitros(p => p.map(a => a.id === id ? { ...a, status: 'REJEITADO' } : a))
    setMotivo('')
    setModal(null)
  }

  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">ÁRBITROS</h2>
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-federation/20">
              {['Nome','Cidade','Nível','Status','Ações'].map(h => (
                <th key={h} className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {arbitros.map(a => (
              <tr key={a.id} className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150">
                <td className="px-4 py-3 font-body text-fht-white text-sm">{a.nome}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.cidade}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.nivel || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${arbitroBadge[a.status]}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3">
                  {a.status === 'PENDENTE' && (
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ type: 'aprovar', id: a.id })}
                        className="font-body text-green-400 text-xs hover:underline">Aprovar</button>
                      <button onClick={() => setModal({ type: 'rejeitar', id: a.id })}
                        className="font-body text-red-400 text-xs hover:underline">Rejeitar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === 'aprovar' && (
        <ConfirmModal title="CREDENCIAR ÁRBITRO" message="Selecione o nível do árbitro:"
          confirmLabel="CREDENCIAR" confirmClass="text-night bg-green-500 hover:bg-green-400"
          onConfirm={() => handleAprovar(modal.id)} onClose={() => setModal(null)}>
          <select value={nivel} onChange={e => setNivel(e.target.value)} required className={sel}>
            <option value="" disabled>Selecione o nível</option>
            {NIVEIS_APROVACAO.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </ConfirmModal>
      )}
      {modal?.type === 'rejeitar' && (
        <ConfirmModal title="REJEITAR ÁRBITRO" message="Informe o motivo:"
          confirmLabel="REJEITAR" confirmClass="text-fht-white bg-red-500 hover:bg-red-400"
          onConfirm={() => handleRejeitar(modal.id)} onClose={() => setModal(null)}>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} placeholder="Motivo..."
            className={`${inp} resize-none`} />
        </ConfirmModal>
      )}
    </div>
  )
}

/* ── Placeholder V2 ────────────────────────────────────────── */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-federation/20 border border-federation/30 rounded-xl flex items-center justify-center mb-4">
        <Trophy size={28} className="text-gold/50" />
      </div>
      <p className="font-display text-fht-white text-2xl mb-2">{title}</p>
      <p className="font-body text-gray-soft text-sm">Disponível na versão 2.0</p>
    </div>
  )
}

/* ── Sidebar nav ───────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',  label: 'Dashboard',    Icon: LayoutDashboard, disabled: false },
  { id: 'clubes',     label: 'Clubes',        Icon: Shield,          disabled: false },
  { id: 'atletas',    label: 'Atletas',       Icon: Users,           disabled: false },
  { id: 'arbitros',   label: 'Árbitros',      Icon: Star,            disabled: false },
  { id: 'competicoes',label: 'Competições',   Icon: Trophy,          disabled: true },
  { id: 'noticias',   label: 'Notícias',      Icon: Newspaper,       disabled: true },
  { id: 'documentos', label: 'Documentos',    Icon: FileText,        disabled: true },
] as const

/* ── Main ──────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [sideOpen, setSideOpen] = useState(false)

  function handleLogout() { logout(); navigate('/login', { replace: true }) }

  return (
    <div className="min-h-screen bg-[#070D1E] flex">
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 w-64 bg-[#0a1628] border-r border-federation/20 flex flex-col transition-transform duration-300
        ${sideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-federation/20">
          <p className="font-body text-gold text-xs uppercase tracking-widest mb-0.5">Admin FHT</p>
          <p className="font-display text-fht-white text-xl leading-tight truncate">{user?.name ?? 'Administrador'}</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          {NAV.map(({ id, label, Icon, disabled }) => (
            <button key={id}
              disabled={disabled}
              onClick={() => { setPage(id as Page); setSideOpen(false) }}
              className={`w-full flex items-center gap-3 px-6 py-3 font-body text-sm transition-colors duration-200 text-left
                ${disabled ? 'text-gray-soft/40 cursor-not-allowed' : page === id
                  ? 'bg-gold/10 text-gold border-r-2 border-gold'
                  : 'text-gray-soft hover:text-fht-white hover:bg-federation/10'}`}>
              <Icon size={18} className="flex-shrink-0" />
              {label}
              {disabled && <span className="ml-auto text-xs text-gray-soft/40">V2</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-federation/20">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-gray-soft hover:text-red-400 transition-colors duration-200 rounded-lg hover:bg-red-500/10">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-[#0a1628] border-b border-federation/20 px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSideOpen(true)} className="text-gray-soft hover:text-gold transition-colors duration-250">
            <Menu size={22} />
          </button>
          <span className="font-display text-fht-white text-xl">ADMIN FHT</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {page === 'dashboard'   && <DashboardPage />}
          {page === 'clubes'      && <ClubesPage />}
          {page === 'atletas'     && <AtletasPage />}
          {page === 'arbitros'    && <ArbitrosPage />}
          {page === 'competicoes' && <PlaceholderPage title="COMPETIÇÕES" />}
          {page === 'noticias'    && <PlaceholderPage title="NOTÍCIAS" />}
          {page === 'documentos'  && <PlaceholderPage title="DOCUMENTOS" />}
        </main>
      </div>
    </div>
  )
}
