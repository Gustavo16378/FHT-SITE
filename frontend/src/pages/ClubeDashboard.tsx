import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, Users, UserPlus, Trophy, Settings, LogOut, Menu, X,
  CheckCircle, AlertCircle, Upload, ChevronRight, ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { maskCPF, maskPhone, maskCEP, validateCPF } from '../utils/masks'
import { UFS } from '../utils/ufs'
import { apiGet, apiPostForm, apiPut, ApiError } from '../services/api'
import type { AtletaDTO, AtletaStatus } from '../types/api'

/* ── tipos ───────────────────────────────────────────────── */
type Page = 'dashboard' | 'atletas' | 'cadastrar' | 'dados'

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
}

function errMsg(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return 'Ocorreu um erro inesperado.'
}

const statusBadge: Record<AtletaStatus, string> = {
  ATIVO: 'text-green-400 bg-green-500/10 border-green-500/30',
  AGUARDANDO_PAGAMENTO: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
  SUSPENSO: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
}
const statusLabel: Record<AtletaStatus, string> = {
  ATIVO: 'Ativo',
  AGUARDANDO_PAGAMENTO: 'Aguardando pgto.',
  REJEITADO: 'Rejeitado',
  SUSPENSO: 'Suspenso',
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

/* ── mini-gráficos (SVG/CSS puro, sem lib) ───────────────── */
function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-gray-soft text-xs w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-federation/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="font-body text-fht-white text-xs w-5 text-right">{value}</span>
    </div>
  )
}

function Donut({ pct, center, sub }: { pct: number; center: string; sub: string }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const off = circ - (Math.max(0, Math.min(100, pct)) / 100) * circ
  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(26,58,143,0.25)" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F5C518" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-fht-white text-2xl leading-none">{center}</span>
        <span className="font-body text-gray-soft text-[10px] uppercase tracking-wider">{sub}</span>
      </div>
    </div>
  )
}

/* ── Dashboard Cards + gráficos ──────────────────────────── */
function DashboardPage({ atletas }: { atletas: AtletaDTO[] }) {
  const cards = [
    { label: 'Total de Atletas', value: atletas.length, color: 'border-federation/30' },
    { label: 'Atletas Ativos', value: atletas.filter(a => a.status === 'ATIVO').length, color: 'border-green-500/30' },
    { label: 'Aguardando Aprovação', value: atletas.filter(a => a.status === 'AGUARDANDO_PAGAMENTO').length, color: 'border-yellow-500/30' },
    { label: 'Rejeitados', value: atletas.filter(a => a.status === 'REJEITADO').length, color: 'border-red-500/30' },
  ]

  // Elenco por categoria — dados REAIS dos atletas do clube
  const porCategoria = CATEGORIAS.map(c => ({ label: c, value: atletas.filter(a => a.categoria === c).length }))
  const maxCat = Math.max(1, ...porCategoria.map(x => x.value))

  // Desempenho em competições — MOCK (módulo de Competições ainda não existe)
  const desemp = { vitorias: 12, empates: 3, derrotas: 5, competicoes: 3 }
  const jogos = desemp.vitorias + desemp.empates + desemp.derrotas
  const aproveitamento = jogos ? Math.round(((desemp.vitorias * 3 + desemp.empates) / (jogos * 3)) * 100) : 0
  const mediaVit = (desemp.vitorias / desemp.competicoes).toFixed(1)

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

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        {/* Elenco por categoria (real) */}
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-6">
          <p className="font-display text-gold text-xs tracking-widest mb-5">ELENCO POR CATEGORIA</p>
          <div className="flex flex-col gap-3">
            {porCategoria.map(c => (
              <BarRow key={c.label} label={c.label} value={c.value} max={maxCat} color="#1E4DB7" />
            ))}
          </div>
        </div>

        {/* Desempenho em competições (mock) */}
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-display text-gold text-xs tracking-widest">DESEMPENHO EM COMPETIÇÕES</p>
            <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">demonstração</span>
          </div>
          <div className="flex items-center gap-6">
            <Donut pct={aproveitamento} center={`${aproveitamento}%`} sub="aproveit." />
            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg py-2">
                <p className="font-display text-green-400 text-2xl">{desemp.vitorias}</p>
                <p className="font-body text-gray-soft text-[10px] uppercase">Vitórias</p>
              </div>
              <div className="bg-federation/10 border border-federation/20 rounded-lg py-2">
                <p className="font-display text-fht-white text-2xl">{desemp.empates}</p>
                <p className="font-body text-gray-soft text-[10px] uppercase">Empates</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg py-2">
                <p className="font-display text-red-400 text-2xl">{desemp.derrotas}</p>
                <p className="font-body text-gray-soft text-[10px] uppercase">Derrotas</p>
              </div>
              <div className="col-span-3 flex items-center justify-between bg-gold/5 border border-gold/20 rounded-lg px-3 py-2 mt-1">
                <span className="font-body text-gray-soft text-xs">Média de vitórias / competição</span>
                <span className="font-display text-gold text-lg">{mediaVit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Meus Atletas ────────────────────────────────────────── */
function AtletasPage({ atletas, onCadastrar, onVer }: {
  atletas: AtletaDTO[]; onCadastrar: () => void; onVer: (a: AtletaDTO) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-fht-white text-3xl">MEUS ATLETAS</h2>
        <button onClick={onCadastrar}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
          + CADASTRAR
        </button>
      </div>
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-federation/20">
              {['Nome','Posição','Categoria','Status','Ações'].map(h => (
                <th key={h} className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {atletas.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center font-body text-gray-soft text-sm">Nenhum atleta cadastrado ainda.</td></tr>
            ) : atletas.map(a => (
              <tr key={a.id} className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150">
                <td className="px-4 py-3 font-body text-fht-white text-sm">{a.nomeCompleto}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.posicao}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.categoria}</td>
                <td className="px-4 py-3">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${statusBadge[a.status]}`}>
                    {statusLabel[a.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onVer(a)} className="font-body text-gold text-xs hover:underline">Ver / editar →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Detalhe + edição do atleta (clube edita os próprios) ─── */
function AtletaDetailPanel({ atleta, onClose, onSaved }: {
  atleta: AtletaDTO; onClose: () => void; onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    nomeCompleto: atleta.nomeCompleto,
    dataNascimento: (atleta.dataNascimento ?? '').slice(0, 10),
    sexo: atleta.sexo,
    rg: atleta.rg,
    telefone: atleta.telefone ?? '',
    email: atleta.email ?? '',
    cidade: atleta.cidade ?? '',
    ufResidencia: atleta.ufResidencia ?? 'TO',
    posicao: atleta.posicao,
    categoria: atleta.categoria,
    transferencia: atleta.transferencia,
    clubeAnterior: atleta.clubeAnterior ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  async function salvar() {
    setSaving(true); setErro('')
    try {
      await apiPut(`/api/atletas/${atleta.id}`, form)
      onSaved()
      onClose()
    } catch (e) {
      setErro(errMsg(e)); setSaving(false)
    }
  }

  const Info = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="font-body text-gray-soft text-xs uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-body text-fht-white text-sm">{value || '—'}</p>
    </div>
  )

  const docs = [
    { label: 'Foto 3x4', url: atleta.fotoUrl },
    { label: 'RG digitalizado', url: atleta.rgUrl },
    { label: 'Comprovante de residência', url: atleta.comprovanteResidenciaUrl },
    { label: 'Comprovante de pagamento Pix', url: atleta.comprovantePagamentoUrl },
  ]

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div className="w-full max-w-2xl h-full bg-[#0a1628] border-l border-federation/20 overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between p-6 border-b border-federation/20 sticky top-0 bg-[#0a1628] z-10">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-xl bg-federation/20 border border-federation/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {atleta.fotoUrl
                ? <img src={atleta.fotoUrl} alt={atleta.nomeCompleto} className="w-full h-full object-cover" />
                : <Users size={24} className="text-gray-soft" />}
            </div>
            <div>
              <span className={`font-body text-xs px-2.5 py-0.5 rounded-full border ${statusBadge[atleta.status]}`}>
                {statusLabel[atleta.status]}
              </span>
              <h2 className="font-display text-fht-white text-xl leading-tight mt-1">{atleta.nomeCompleto}</h2>
              <p className="font-body text-gray-soft text-sm">{atleta.posicao} · {atleta.categoria}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-soft hover:text-gold transition-colors duration-250 mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-6">
          {erro && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="font-body text-red-400 text-sm">{erro}</p>
            </div>
          )}

          {editing ? (
            <div className="flex flex-col gap-4">
              <div>
                <span className={lbl}>Nome completo</span>
                <input name="nomeCompleto" value={form.nomeCompleto} onChange={change} className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={lbl}>Nascimento</span>
                  <input type="date" name="dataNascimento" value={form.dataNascimento} onChange={change} className={inp} />
                </div>
                <div>
                  <span className={lbl}>Sexo</span>
                  <select name="sexo" value={form.sexo} onChange={change} className={sel}>
                    <option value="M">Masculino</option><option value="F">Feminino</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className={lbl}>RG</span><input name="rg" value={form.rg} onChange={change} className={inp} /></div>
                <div><span className={lbl}>Telefone</span><input name="telefone" value={form.telefone} onChange={change} className={inp} /></div>
              </div>
              <div><span className={lbl}>E-mail</span><input name="email" value={form.email} onChange={change} className={inp} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2"><span className={lbl}>Cidade</span><input name="cidade" value={form.cidade} onChange={change} className={inp} /></div>
                <div>
                  <span className={lbl}>UF</span>
                  <select name="ufResidencia" value={form.ufResidencia} onChange={change} className={sel}>
                    {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={lbl}>Posição</span>
                  <select name="posicao" value={form.posicao} onChange={change} className={sel}>
                    {POSICOES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <span className={lbl}>Categoria</span>
                  <select name="categoria" value={form.categoria} onChange={change} className={sel}>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <p className="font-body text-gray-soft/60 text-xs">CPF, documentos e status não são editáveis aqui.</p>
            </div>
          ) : (
            <>
              <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                <p className="font-display text-gold text-xs tracking-widest mb-4">DADOS PESSOAIS</p>
                <div className="grid grid-cols-2 gap-4">
                  <Info label="CPF" value={atleta.cpf} />
                  <Info label="RG" value={atleta.rg} />
                  <Info label="Nascimento" value={fmtDate(atleta.dataNascimento)} />
                  <Info label="Sexo" value={atleta.sexo === 'M' ? 'Masculino' : 'Feminino'} />
                  <Info label="Telefone" value={atleta.telefone ?? ''} />
                  <Info label="E-mail" value={atleta.email ?? ''} />
                  <Info label="Cidade / UF" value={`${atleta.cidade ?? '—'} / ${atleta.ufResidencia ?? '—'}`} />
                </div>
              </div>
              <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                <p className="font-display text-gold text-xs tracking-widest mb-4">DADOS ESPORTIVOS</p>
                <div className="grid grid-cols-2 gap-4">
                  <Info label="Posição" value={atleta.posicao} />
                  <Info label="Categoria" value={atleta.categoria} />
                  {atleta.transferencia && <Info label="Transferência de" value={atleta.clubeAnterior ?? '—'} />}
                  {atleta.taxaValor != null && <Info label="Taxa" value={`R$ ${Number(atleta.taxaValor).toFixed(2)} — ${atleta.taxaAno ?? ''}`} />}
                </div>
              </div>
              <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                <p className="font-display text-gold text-xs tracking-widest mb-4">DOCUMENTOS</p>
                <div className="flex flex-col gap-2">
                  {docs.map(({ label, url }) => url ? (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 bg-federation/10 border border-federation/20 rounded-lg hover:border-gold/40 transition-colors duration-200">
                      <span className="font-body text-fht-white text-sm">{label}</span>
                      <span className="font-body text-gray-soft text-xs">Abrir →</span>
                    </a>
                  ) : (
                    <div key={label} className="flex items-center justify-between px-4 py-3 bg-federation/5 border border-federation/10 rounded-lg opacity-60">
                      <span className="font-body text-gray-soft text-sm">{label}</span>
                      <span className="font-body text-gray-soft text-xs">não enviado</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#0a1628] border-t border-federation/20 p-5 flex flex-wrap gap-3">
          {editing ? (
            <>
              <button onClick={salvar} disabled={saving}
                className="flex-1 font-display text-night bg-gold hover:bg-gold-light py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-50">
                {saving ? 'SALVANDO...' : 'SALVAR'}
              </button>
              <button onClick={() => setEditing(false)} disabled={saving}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
                CANCELAR
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="flex-1 font-display text-night bg-gold hover:bg-gold-light py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
                EDITAR DADOS
              </button>
              <button onClick={onClose}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
                FECHAR
              </button>
            </>
          )}
        </div>
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
  const [errMessage, setErrMessage] = useState('')

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
    setErrMessage('')
    try {
      const data = new FormData()
      data.append('nomeCompleto', form.nomeCompleto)
      data.append('dataNascimento', form.dataNascimento)
      data.append('sexo', form.sexo === 'Masculino' ? 'M' : 'F')
      data.append('cpf', form.cpf)
      data.append('rg', form.rg)
      data.append('rgOrgaoEmissor', form.orgaoEmissor)
      data.append('naturalidadeCidade', form.naturalidadeCidade)
      data.append('naturalidadeUf', form.naturalidadeUf)
      data.append('telefone', form.telefone)
      data.append('email', form.email)
      data.append('cep', form.cep)
      data.append('logradouro', form.logradouro)
      data.append('numero', form.numero)
      data.append('cidade', form.cidade)
      data.append('ufResidencia', form.uf)
      data.append('posicao', form.posicao)
      data.append('categoria', form.categoria)
      data.append('isTransferencia', String(form.transferencia))
      if (form.transferencia) data.append('clubeAnterior', form.clubeAnterior)
      if (foto) data.append('foto', foto)
      if (rgDoc) data.append('rgDoc', rgDoc)
      if (compRes) data.append('comprovanteResidencia', compRes)
      if (compPix) data.append('comprovantePix', compPix)

      await apiPostForm('/api/atletas', data)
      onSuccess()
    } catch (err) {
      setStatus('error')
      setErrMessage(errMsg(err))
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
                <p className="font-body text-red-400 text-sm">{errMessage}</p>
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
  { id: 'dashboard', label: 'Dashboard',        Icon: Home,     disabled: false },
  { id: 'atletas',   label: 'Meus Atletas',     Icon: Users,    disabled: false },
  { id: 'cadastrar', label: 'Cadastrar Atleta', Icon: UserPlus, disabled: false },
  { id: 'inscricoes',label: 'Inscrições',        Icon: Trophy,   disabled: true },
  { id: 'dados',     label: 'Meus Dados',        Icon: Settings, disabled: true },
] as const

/* ── Main ────────────────────────────────────────────────── */
export default function ClubeDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [sideOpen, setSideOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [atletas, setAtletas] = useState<AtletaDTO[]>([])
  const [atletaDetalhe, setAtletaDetalhe] = useState<AtletaDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const dtos = await apiGet<AtletaDTO[]>('/api/atletas')
      setAtletas(dtos)
      setLoadError('')
    } catch (e) {
      if (!silent) setLoadError(errMsg(e))
      throw e
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { reload().catch(() => {}) }, [reload])

  function handleLogout() { logout(); navigate('/login', { replace: true }) }

  function handleAtletaSuccess() {
    setSuccessMsg('Atleta cadastrado com sucesso! Aguarde a validação da FHT.')
    setPage('atletas')
    reload(true).catch(() => {})
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
        <div className="p-4 border-t border-federation/20 flex flex-col gap-1">
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-gray-soft hover:text-gold transition-colors duration-200 rounded-lg hover:bg-federation/10">
            <Home size={18} /> Ver site
          </button>
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

          {loadError && page !== 'cadastrar' && (
            <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="font-body text-red-400 text-sm">{loadError}</p>
              </div>
              <button onClick={() => reload().catch(() => {})}
                className="font-body text-red-400 text-xs underline hover:text-red-300">Tentar novamente</button>
            </div>
          )}

          {loading && page !== 'cadastrar' ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {page === 'dashboard' && <DashboardPage atletas={atletas} />}
              {page === 'atletas' && <AtletasPage atletas={atletas} onCadastrar={() => setPage('cadastrar')} onVer={setAtletaDetalhe} />}
              {page === 'cadastrar' && <CadastrarAtletaPage onSuccess={handleAtletaSuccess} />}
            </>
          )}

          {atletaDetalhe && (
            <AtletaDetailPanel
              atleta={atletaDetalhe}
              onClose={() => setAtletaDetalhe(null)}
              onSaved={() => reload(true).catch(() => {})}
            />
          )}
        </main>
      </div>
    </div>
  )
}
