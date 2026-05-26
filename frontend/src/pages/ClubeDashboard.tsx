import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, Users, UserPlus, Trophy, Settings, LogOut, Menu, X,
  CheckCircle, AlertCircle, Upload, ChevronRight, ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { maskCPF, maskPhone, maskCEP, validateCPF } from '../utils/masks'
import { UFS } from '../utils/ufs'

/* ── tipos ───────────────────────────────────────────────── */
type Page = 'dashboard' | 'atletas' | 'cadastrar' | 'dados'

interface AtletaMock {
  id: number; nome: string; posicao: string; categoria: string
  status: 'ATIVO' | 'AGUARDANDO_PAGAMENTO' | 'REJEITADO'
}

const atletasMock: AtletaMock[] = [
  { id: 1, nome: 'João Pedro Silva', posicao: 'Armador Central', categoria: 'Sub-18', status: 'ATIVO' },
  { id: 2, nome: 'Carlos Eduardo Lima', posicao: 'Goleiro', categoria: 'Adulto', status: 'AGUARDANDO_PAGAMENTO' },
  { id: 3, nome: 'Lucas Ferreira Santos', posicao: 'Pivô', categoria: 'Sub-16', status: 'REJEITADO' },
]

const statusBadge: Record<AtletaMock['status'], string> = {
  ATIVO: 'text-green-400 bg-green-500/10 border-green-500/30',
  AGUARDANDO_PAGAMENTO: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
}
const statusLabel: Record<AtletaMock['status'], string> = {
  ATIVO: 'Ativo',
  AGUARDANDO_PAGAMENTO: 'Aguardando pgto.',
  REJEITADO: 'Rejeitado',
}

/* ── estilos ─────────────────────────────────────────────── */
const inp = 'font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250 w-full'
const sel = `${inp} appearance-none cursor-pointer`
const lbl = 'font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block'

/* ── formulário multi-step ──────────────────────────────── */
const POSICOES = ['Goleiro','Armador Central','Armador Direito','Armador Esquerdo','Ponta Direita','Ponta Esquerda','Pivô']
const CATEGORIAS = ['Sub-12','Sub-14','Sub-16','Sub-18','Adulto']
const STEPS = ['Dados Pessoais','Contato e Endereço','Dados Esportivos','Documentos e Pagamento']

const blankAtleta = {
  // etapa 1
  nomeCompleto:'', dataNascimento:'', sexo:'', cpf:'', rg:'', orgaoEmissor:'', naturalidadeCidade:'', naturalidadeUf:'TO',
  // etapa 2
  telefone:'', email:'', cep:'', logradouro:'', numero:'', bairro:'', cidade:'', uf:'TO',
  // etapa 3
  posicao:'', categoria:'', transferencia: false, clubeAnterior:'',
}

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display flex-shrink-0 transition-colors duration-250 ${
            i < step ? 'bg-gold text-night' : i === step ? 'bg-gold text-night' : 'bg-federation/20 text-gray-soft border border-federation/30'
          }`}>{i < step ? <CheckCircle size={14} /> : i + 1}</div>
          <span className={`font-body text-xs hidden sm:block ${i === step ? 'text-fht-white' : 'text-gray-soft'}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-gold/50' : 'bg-federation/20'}`} />}
        </div>
      ))}
    </div>
  )
}

function FileBtn({ file, onChange, label: lbl2, accept }: {
  file: File | null; onChange: (f: File | null) => void; label: string; accept: string
}) {
  return (
    <div>
      <span className={lbl}>{lbl2} *</span>
      <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-body transition-colors duration-250 cursor-pointer ${
        file ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-federation/20 bg-[#0d1b2a]/80 text-gray-soft hover:border-gold/40 hover:text-fht-white'
      }`}>
        <input type="file" accept={accept} required className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
        {file
          ? <><CheckCircle size={16} className="flex-shrink-0" /><span className="truncate">{file.name}</span></>
          : <><Upload size={16} className="flex-shrink-0" /><span>Selecionar arquivo</span></>}
      </label>
    </div>
  )
}

/* ── Dashboard Cards ─────────────────────────────────────── */
function DashboardPage() {
  const cards = [
    { label: 'Total de Atletas', value: 3, color: 'border-federation/30' },
    { label: 'Atletas Ativos', value: 1, color: 'border-green-500/30' },
    { label: 'Aguardando Aprovação', value: 1, color: 'border-yellow-500/30' },
    { label: 'Rejeitados', value: 1, color: 'border-red-500/30' },
  ]
  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">DASHBOARD</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-[#0d1b2a]/60 border ${c.color} rounded-xl p-6`}>
            <p className="font-body text-gray-soft text-xs uppercase tracking-wider mb-2">{c.label}</p>
            <p className="font-display text-fht-white text-4xl">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Meus Atletas ────────────────────────────────────────── */
function AtletasPage({ onCadastrar }: { onCadastrar: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-fht-white text-3xl">MEUS ATLETAS</h2>
        <button onClick={onCadastrar}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
          + CADASTRAR
        </button>
      </div>
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-federation/20">
              {['Nome','Posição','Categoria','Status','Ações'].map(h => (
                <th key={h} className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {atletasMock.map(a => (
              <tr key={a.id} className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150">
                <td className="px-4 py-3 font-body text-fht-white text-sm">{a.nome}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.posicao}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.categoria}</td>
                <td className="px-4 py-3">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${statusBadge[a.status]}`}>
                    {statusLabel[a.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="font-body text-gold text-xs hover:underline">Ver detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Cadastrar Atleta ────────────────────────────────────── */
function CadastrarAtletaPage({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(blankAtleta)
  const [cpfErr, setCpfErr] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [foto, setFoto] = useState<File | null>(null)
  const [rgDoc, setRgDoc] = useState<File | null>(null)
  const [compRes, setCompRes] = useState<File | null>(null)
  const [compPix, setCompPix] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle'|'loading'|'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === 'cpf') {
      const fmt = maskCPF(value)
      setForm(p => ({ ...p, cpf: fmt }))
      if (fmt.replace(/\D/g, '').length === 11) setCpfErr(validateCPF(fmt) ? '' : 'CPF inválido')
      else setCpfErr('')
      return
    }
    if (name === 'telefone') { setForm(p => ({ ...p, telefone: maskPhone(value) })); return }
    if (name === 'cep') {
      const fmt = maskCEP(value)
      setForm(p => ({ ...p, cep: fmt }))
      if (fmt.replace(/\D/g, '').length === 8) fetchCEP(fmt.replace(/\D/g, ''))
      return
    }
    setForm(p => ({ ...p, [name]: value }))
  }

  async function fetchCEP(cep: string) {
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(p => ({ ...p, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }))
      }
    } catch { /* silently fail */ }
    setCepLoading(false)
  }

  async function handleFinalSubmit() {
    setStatus('loading')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, String(v)))
      if (foto) data.append('foto', foto)
      if (rgDoc) data.append('rgDoc', rgDoc)
      if (compRes) data.append('compResidencia', compRes)
      if (compPix) data.append('compPix', compPix)

      const token = localStorage.getItem('fht_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/atletas`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.message || `Erro ${res.status}`)
      }
      onSuccess()
    } catch (err) {
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'Erro ao cadastrar. Tente novamente.')
    }
  }

  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">CADASTRAR ATLETA</h2>
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-6">
        <StepBar step={step} />

        {/* Etapa 1 */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <span className={lbl}>Nome completo *</span>
              <input required name="nomeCompleto" value={form.nomeCompleto} onChange={handleChange}
                placeholder="Nome do atleta" className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={lbl}>Data de nascimento *</span>
                <input required type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} className={inp} />
              </div>
              <div>
                <span className={lbl}>Sexo *</span>
                <select required name="sexo" value={form.sexo} onChange={handleChange} className={sel}>
                  <option value="" disabled>Selecione</option>
                  <option>Masculino</option><option>Feminino</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={lbl}>CPF *</span>
                <input required name="cpf" value={form.cpf} onChange={handleChange}
                  placeholder="000.000.000-00" className={`${inp} ${cpfErr ? 'border-red-500' : ''}`} />
                {cpfErr && <p className="font-body text-red-400 text-xs mt-1">{cpfErr}</p>}
              </div>
              <div>
                <span className={lbl}>RG *</span>
                <input required name="rg" value={form.rg} onChange={handleChange} placeholder="0000000" className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={lbl}>Órgão emissor</span>
                <input name="orgaoEmissor" value={form.orgaoEmissor} onChange={handleChange} placeholder="SSP/TO" className={inp} />
              </div>
              <div>
                <span className={lbl}>Naturalidade — Cidade</span>
                <input name="naturalidadeCidade" value={form.naturalidadeCidade} onChange={handleChange} placeholder="Palmas" className={inp} />
              </div>
            </div>
            <div>
              <span className={lbl}>Naturalidade — UF</span>
              <select name="naturalidadeUf" value={form.naturalidadeUf} onChange={handleChange} className={sel}>
                {UFS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Etapa 2 */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={lbl}>Telefone / WhatsApp</span>
                <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(63) 99999-9999" className={inp} />
              </div>
              <div>
                <span className={lbl}>E-mail</span>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="atleta@email.com" className={inp} />
              </div>
            </div>
            <div>
              <span className={lbl}>CEP {cepLoading && <span className="text-gold">buscando...</span>}</span>
              <input name="cep" value={form.cep} onChange={handleChange} placeholder="77000-000" className={inp} />
            </div>
            <div>
              <span className={lbl}>Logradouro</span>
              <input name="logradouro" value={form.logradouro} onChange={handleChange} placeholder="Rua, Avenida..." className={inp} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className={lbl}>Número</span>
                <input name="numero" value={form.numero} onChange={handleChange} placeholder="123" className={inp} />
              </div>
              <div className="col-span-2">
                <span className={lbl}>Bairro</span>
                <input name="bairro" value={form.bairro} onChange={handleChange} placeholder="Bairro" className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <span className={lbl}>Cidade</span>
                <input name="cidade" value={form.cidade} onChange={handleChange} placeholder="Palmas" className={inp} />
              </div>
              <div>
                <span className={lbl}>UF</span>
                <select name="uf" value={form.uf} onChange={handleChange} className={sel}>
                  {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 3 */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={lbl}>Posição *</span>
                <select required name="posicao" value={form.posicao} onChange={handleChange} className={sel}>
                  <option value="" disabled>Selecione</option>
                  {POSICOES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <span className={lbl}>Categoria *</span>
                <select required name="categoria" value={form.categoria} onChange={handleChange} className={sel}>
                  <option value="" disabled>Selecione</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#0d1b2a]/40 border border-federation/20 rounded-lg px-4 py-3">
              <span className="font-body text-fht-white text-sm">É transferência de outro clube?</span>
              <button type="button" onClick={() => setForm(p => ({ ...p, transferencia: !p.transferencia }))}
                className={`w-12 h-6 rounded-full transition-colors duration-250 relative ${form.transferencia ? 'bg-gold' : 'bg-federation/40'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-250 ${form.transferencia ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {form.transferencia && (
              <div>
                <span className={lbl}>Nome do clube anterior</span>
                <input name="clubeAnterior" value={form.clubeAnterior} onChange={handleChange}
                  placeholder="Nome do clube" className={inp} />
              </div>
            )}
          </div>
        )}

        {/* Etapa 4 */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <FileBtn file={foto} onChange={setFoto} label="Foto 3x4 digital" accept="image/*" />
            <FileBtn file={rgDoc} onChange={setRgDoc} label="RG digitalizado (PDF ou imagem)" accept=".pdf,image/*" />
            <FileBtn file={compRes} onChange={setCompRes} label="Comprovante de residência (PDF ou imagem)" accept=".pdf,image/*" />

            {/* QR Code PIX */}
            <div className="bg-gold/5 border border-gold/30 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-28 h-28 bg-fht-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-body text-night text-xs text-center px-2">QR Code PIX FHT aqui</span>
              </div>
              <div>
                <p className="font-display text-gold text-lg leading-none mb-1">TAXA DE CADASTRO</p>
                <p className="font-display text-fht-white text-3xl mb-2">R$ 35,00 <span className="text-gray-soft text-base font-body font-normal">/ atleta / ano</span></p>
                <p className="font-body text-gray-soft text-xs leading-relaxed">Pague via PIX e anexe o comprovante abaixo. A FHT irá validar e ativar o atleta em até 2 dias úteis.</p>
              </div>
            </div>

            <FileBtn file={compPix} onChange={setCompPix} label="Comprovante de pagamento PIX" accept="image/*,.pdf" />

            {status === 'error' && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="font-body text-red-400 text-sm">{errMsg}</p>
              </div>
            )}
          </div>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-federation/20">
          <button type="button" onClick={() => setStep(p => p - 1)} disabled={step === 0}
            className="flex items-center gap-2 font-display text-gray-soft hover:text-fht-white border border-federation/20 hover:border-federation/50 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={16} /> ANTERIOR
          </button>
          {step < 3 ? (
            <button type="button" onClick={() => setStep(p => p + 1)}
              className="flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
              PRÓXIMO <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleFinalSubmit} disabled={status === 'loading'}
              className="font-display text-night bg-gold hover:bg-gold-light px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'loading' ? 'CADASTRANDO...' : 'CADASTRAR ATLETA'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Sidebar ─────────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: Home },
  { id: 'atletas', label: 'Meus Atletas', Icon: Users },
  { id: 'cadastrar', label: 'Cadastrar Atleta', Icon: UserPlus },
  { id: 'inscricoes', label: 'Inscrições', Icon: Trophy, disabled: true },
  { id: 'dados', label: 'Meus Dados', Icon: Settings, disabled: true },
] as const

/* ── Main ────────────────────────────────────────────────── */
export default function ClubeDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [sideOpen, setSideOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  function handleLogout() { logout(); navigate('/login', { replace: true }) }

  function handleAtletaSuccess() {
    setSuccessMsg('Atleta cadastrado com sucesso! Aguarde a validação da FHT.')
    setPage('atletas')
  }

  return (
    <div className="min-h-screen bg-[#070D1E] flex">
      {/* Overlay mobile */}
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 w-64 bg-[#0a1628] border-r border-federation/20 flex flex-col transition-transform duration-300
        ${sideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-federation/20">
          <p className="font-body text-gold text-xs uppercase tracking-widest mb-0.5">Painel do Clube</p>
          <p className="font-display text-fht-white text-xl leading-tight truncate">{user?.name ?? 'Clube'}</p>
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
        {/* Topbar */}
        <header className="bg-[#0a1628] border-b border-federation/20 px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSideOpen(true)} className="text-gray-soft hover:text-gold transition-colors duration-250">
            <Menu size={22} />
          </button>
          <span className="font-display text-fht-white text-xl">PAINEL DO CLUBE</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {successMsg && (
            <div className="flex items-center justify-between gap-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                <p className="font-body text-green-400 text-sm">{successMsg}</p>
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-green-400/60 hover:text-green-400">
                <X size={16} />
              </button>
            </div>
          )}

          {page === 'dashboard' && <DashboardPage />}
          {page === 'atletas' && <AtletasPage onCadastrar={() => setPage('cadastrar')} />}
          {page === 'cadastrar' && <CadastrarAtletaPage onSuccess={handleAtletaSuccess} />}
        </main>
      </div>
    </div>
  )
}
