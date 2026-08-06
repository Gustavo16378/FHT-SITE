import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, Users, UserPlus, Settings, LogOut, Menu, X,
  CheckCircle, AlertCircle, Upload, ChevronRight, ChevronLeft,
  Building2, FileText, Edit3, Save, Contact,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { maskCPF, maskCNPJ, maskPhone, validateCPF } from '../utils/masks'
import { UFS } from '../utils/ufs'
import { apiGet, apiPostForm, apiPostJson, apiPut, apiDelete, ApiError, fileUrl } from '../services/api'
import type {
  AtletaDTO, AtletaStatus, ClubeDTO, ClubeStatus, ClubePessoaDTO, FuncaoPessoa,
  PagamentoPendentesDTO, PagamentoLoteDTO,
} from '../types/api'

/* ── tipos ───────────────────────────────────────────────── */
type Page = 'dashboard' | 'atletas' | 'cadastrar' | 'equipe' | 'dados'

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
  AGUARDANDO_PAGAMENTO: 'text-red-400 bg-red-500/10 border-red-500/30',
  AGUARDANDO_APROVACAO: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
  SUSPENSO: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
}
const statusLabel: Record<AtletaStatus, string> = {
  ATIVO: 'Ativo',
  AGUARDANDO_PAGAMENTO: 'Falta pagamento',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação',
  REJEITADO: 'Rejeitado',
  SUSPENSO: 'Suspenso',
}


const clubeStatusBadge: Record<ClubeStatus, string> = {
  ATIVO: 'text-green-400 bg-green-500/10 border-green-500/30',
  PENDENTE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
  SUSPENSO: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
}
const clubeStatusLabel: Record<ClubeStatus, string> = {
  ATIVO: 'Ativo',
  PENDENTE: 'Pendente',
  REJEITADO: 'Rejeitado',
  SUSPENSO: 'Suspenso',
}

/* ── estilos ─────────────────────────────────────────────── */
const inp = 'font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250 w-full'
const sel = `${inp} appearance-none cursor-pointer`
const lbl = 'font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block'

/* ── formulário multi-step ──────────────────────────────── */
// Posições oficiais definidas pela federação. Um atleta pode ocupar mais de uma
// (ponta direita e esquerda, por exemplo), por isso a seleção é múltipla.
const POSICOES = [
  'Goleiro',
  'Ponta Direita',
  'Ponta Esquerda',
  'Armador Lateral Direito',
  'Armador Lateral Esquerdo',
  'Armador Central',
  'Pivô',
]
const CATEGORIAS = ['Sub-12','Sub-14','Sub-16','Sub-18','Adulto']
const PARENTESCOS = ['Mãe','Pai','Tutor legal','Outro']

/** Etapa "Responsável (LGPD)" só existe quando o atleta é menor de 18 (LGPD art. 14). */
const STEP_LABEL = {
  pessoais: 'Dados Pessoais',
  contato: 'Contato',
  esportivos: 'Dados Esportivos',
  responsavel: 'Responsável (LGPD)',
  documentos: 'Documentos',
} as const
type StepKey = keyof typeof STEP_LABEL

const STEPS_ADULTO: StepKey[] = ['pessoais', 'contato', 'esportivos', 'documentos']
const STEPS_MENOR: StepKey[] = ['pessoais', 'contato', 'esportivos', 'responsavel', 'documentos']

/** Espelha a regra do backend: menor de 18 hoje dispara as exigências do art. 14. */
function isMenorDeIdade(nascimentoIso: string): boolean {
  if (!nascimentoIso) return false
  const d = new Date(`${nascimentoIso}T00:00:00`)
  if (isNaN(d.getTime())) return false
  return new Date(d.getFullYear() + 18, d.getMonth(), d.getDate()) > new Date()
}

const blankAtleta = {
  // etapa 1
  nomeCompleto:'', dataNascimento:'', sexo:'', cpf:'', rg:'', orgaoEmissor:'', naturalidadeCidade:'', naturalidadeUf:'TO',
  // etapa 2 — só contato. O endereço do atleta é o do clube, então não é mais pedido aqui.
  telefone:'', email:'',
  // etapa 3 — posicoes é lista: o atleta pode jogar em mais de uma
  posicoes: [] as string[], categoria:'', transferencia: false, clubeAnterior:'',
  // etapa do responsável (só menores)
  responsavelNome:'', responsavelCpf:'', responsavelParentesco:'', responsavelEmail:'', responsavelTelefone:'',
  consentimentoCadastro: false, consentimentoImagem: false,
}

function StepBar({ steps, step }: { steps: StepKey[]; step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display flex-shrink-0 transition-colors duration-250 ${
            i <= step ? 'bg-gold text-night' : 'bg-federation/20 text-gray-soft border border-federation/30'
          }`}>{i < step ? <CheckCircle size={14} /> : i + 1}</div>
          <span className={`font-body text-xs hidden sm:block ${i === step ? 'text-fht-white' : 'text-gray-soft'}`}>{STEP_LABEL[s]}</span>
          {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-gold/50' : 'bg-federation/20'}`} />}
        </div>
      ))}
    </div>
  )
}

function FileBtn({ file, onChange, label: lbl2, accept, obrigatorio = false, hint }: {
  file: File | null; onChange: (f: File | null) => void; label: string; accept: string
  obrigatorio?: boolean; hint?: string
}) {
  return (
    <div>
      <span className={lbl}>
        {lbl2} {obrigatorio ? <span className="text-gold">*</span> : <span className="normal-case tracking-normal">(opcional)</span>}
      </span>
      <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-body transition-colors duration-250 cursor-pointer ${
        file ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-federation/20 bg-[#0d1b2a]/80 text-gray-soft hover:border-gold/40 hover:text-fht-white'
      }`}>
        <input type="file" accept={accept} className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
        {file
          ? <><CheckCircle size={16} className="flex-shrink-0" /><span className="truncate">{file.name}</span></>
          : <><Upload size={16} className="flex-shrink-0" /><span>Selecionar arquivo</span></>}
      </label>
      {hint && <p className="font-body text-gray-soft text-xs mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

/** Checkbox de consentimento — destacado, não escondido no meio do texto (LGPD art. 14, §1). */
function ConsentBox({ checked, onChange, titulo, children, obrigatorio = false }: {
  checked: boolean; onChange: (v: boolean) => void; titulo: string
  children: React.ReactNode; obrigatorio?: boolean
}) {
  return (
    <label className={`flex gap-3 p-4 rounded-lg border cursor-pointer transition-colors duration-250 ${
      checked ? 'border-gold/50 bg-gold/5' : 'border-federation/20 bg-[#0d1b2a]/40 hover:border-gold/30'
    }`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 flex-shrink-0 accent-gold cursor-pointer" />
      <span>
        <span className="font-display text-fht-white text-sm block mb-1">
          {titulo} {obrigatorio && <span className="text-gold">*</span>}
        </span>
        <span className="font-body text-gray-soft text-xs leading-relaxed block">{children}</span>
      </span>
    </label>
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
    { label: 'Falta Pagamento', value: atletas.filter(a => a.status === 'AGUARDANDO_PAGAMENTO').length, color: 'border-red-500/30' },
    { label: 'Aguardando Aprovação', value: atletas.filter(a => a.status === 'AGUARDANDO_APROVACAO').length, color: 'border-yellow-500/30' },
  ]

  // Elenco por categoria — dados REAIS dos atletas do clube
  const porCategoria = CATEGORIAS.map(c => ({ label: c, value: atletas.filter(a => a.categoria === c).length }))
  const maxCat = Math.max(1, ...porCategoria.map(x => x.value))

  // Situação da anuidade — dado real do elenco
  const qtdAtivos = atletas.filter(a => a.status === 'ATIVO').length
  const qtdPendentes = atletas.filter(a => a.status === 'AGUARDANDO_PAGAMENTO').length
  const pctQuitado = atletas.length ? Math.round((qtdAtivos / atletas.length) * 100) : 0

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

        {/* Situação da anuidade — dado real, no lugar do desempenho em competições que era mock */}
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-6">
          <p className="font-display text-gold text-xs tracking-widest mb-5">SITUAÇÃO DA ANUIDADE</p>
          {atletas.length === 0 ? (
            <p className="font-body text-gray-soft text-sm py-8 text-center">
              Cadastre os atletas do clube para acompanhar a situação da anuidade aqui.
            </p>
          ) : (
            <div className="flex items-center gap-6">
              <Donut pct={pctQuitado} center={`${pctQuitado}%`} sub="quitado" />
              <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg py-2">
                  <p className="font-display text-green-400 text-2xl">{qtdAtivos}</p>
                  <p className="font-body text-gray-soft text-[10px] uppercase">Em dia</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-2">
                  <p className="font-display text-yellow-400 text-2xl">{qtdPendentes}</p>
                  <p className="font-body text-gray-soft text-[10px] uppercase">Pendentes</p>
                </div>
                <div className="col-span-2 flex items-center justify-between bg-gold/5 border border-gold/20 rounded-lg px-3 py-2 mt-1">
                  <span className="font-body text-gray-soft text-xs">Atletas do clube</span>
                  <span className="font-display text-gold text-lg">{atletas.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * Barra de pagamento da anuidade. Some quando não há pendência.
 * O clube escolhe quem entra no lote — pagar parcial é comum quando o caixa não dá para todos.
 */
function BarraPagamento({ onPago }: { onPago: () => void }) {
  const [pendentes, setPendentes] = useState<PagamentoPendentesDTO | null>(null)
  const [aberto, setAberto] = useState(false)

  const carregar = useCallback(async () => {
    try { setPendentes(await apiGet<PagamentoPendentesDTO>('/api/pagamentos/pendentes')) }
    catch { setPendentes(null) }
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  if (!pendentes || pendentes.atletas.length === 0) return null

  return (
    <>
      <div className="bg-gold/5 border border-gold/30 rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-display text-gold text-sm tracking-widest">ANUIDADE {pendentes.ano} PENDENTE</p>
          <p className="font-body text-gray-soft text-sm mt-1">
            <span className="font-display text-fht-white text-2xl">{brl(pendentes.valorTotal)}</span>
            {' '}· {pendentes.atletas.length} {pendentes.atletas.length === 1 ? 'atleta' : 'atletas'} aguardando pagamento
          </p>
        </div>
        <button onClick={() => setAberto(true)}
          className="font-display text-night bg-gold hover:bg-gold-light px-6 py-3 rounded-lg text-sm tracking-wider transition-colors duration-250 whitespace-nowrap">
          PAGAR ANUIDADE
        </button>
      </div>

      {aberto && (
        <PagamentoModal pendentes={pendentes}
          onClose={() => setAberto(false)}
          onEnviado={() => { void carregar(); onPago() }} />
      )}
    </>
  )
}

function PagamentoModal({ pendentes, onClose, onEnviado }: {
  pendentes: PagamentoPendentesDTO; onClose: () => void; onEnviado: () => void
}) {
  // Todos marcados por padrão: o caso comum é pagar tudo.
  const [marcados, setMarcados] = useState<Set<string>>(new Set(pendentes.atletas.map(a => a.id)))
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [observacao, setObservacao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [protocolo, setProtocolo] = useState('')

  const total = pendentes.valorUnitario * marcados.size

  function alternar(id: string) {
    setMarcados(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  async function enviar() {
    if (marcados.size === 0) { setErro('Selecione ao menos um atleta.'); return }
    if (!comprovante) { setErro('Anexe o comprovante do Pix.'); return }
    setEnviando(true); setErro('')
    try {
      const fd = new FormData()
      fd.append('atletaIds', [...marcados].join(','))
      if (observacao.trim()) fd.append('observacao', observacao.trim())
      fd.append('comprovante', comprovante)
      const lote = await apiPostForm<PagamentoLoteDTO>('/api/pagamentos', fd)
      setProtocolo(lote.protocolo)
      onEnviado()
    } catch (e) { setErro(errMsg(e)); setEnviando(false) }
  }

  // Depois de enviar, a tela vira recibo: o protocolo é o que o clube cita com a federação.
  if (protocolo) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.78)' }} onClick={onClose}>
        <div className="bg-[#0a1628] border border-green-500/30 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 text-center"
          onClick={e => e.stopPropagation()}>
          <CheckCircle size={44} className="text-green-400 mx-auto" />
          <h3 className="font-display text-fht-white text-2xl">PAGAMENTO ENVIADO</h3>
          <p className="font-body text-gray-soft text-sm leading-relaxed">
            Protocolo <span className="font-display text-gold">{protocolo}</span><br />
            A FHT vai conferir o comprovante e dar baixa. Os atletas ficam ativos assim que a
            federação confirmar.
          </p>
          <button onClick={onClose}
            className="font-display text-night bg-gold hover:bg-gold-light py-2.5 rounded-lg text-sm tracking-wider mt-2">
            ENTENDI
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.78)' }} onClick={onClose}>
      <div className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-federation/20 flex items-center justify-between">
          <h3 className="font-display text-fht-white text-xl tracking-wide">PAGAR ANUIDADE {pendentes.ano}</h3>
          <button onClick={onClose} className="text-gray-soft hover:text-fht-white p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={lbl}>Atletas neste pagamento</span>
              <button onClick={() => setMarcados(marcados.size === pendentes.atletas.length
                ? new Set() : new Set(pendentes.atletas.map(a => a.id)))}
                className="font-body text-gold text-xs hover:underline">
                {marcados.size === pendentes.atletas.length ? 'Desmarcar todos' : 'Marcar todos'}
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
              {pendentes.atletas.map(a => (
                <label key={a.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors duration-150 ${
                    marcados.has(a.id) ? 'border-gold/50 bg-gold/5' : 'border-federation/20 bg-[#0d1b2a]/40'
                  }`}>
                  <input type="checkbox" checked={marcados.has(a.id)} onChange={() => alternar(a.id)}
                    className="w-4 h-4 accent-gold cursor-pointer flex-shrink-0" />
                  <span className="flex-1">
                    <span className="font-body text-fht-white text-sm block">{a.nome}</span>
                    <span className="font-body text-gray-soft text-xs">{a.categoria}</span>
                  </span>
                  <span className="font-body text-gray-soft text-sm">{brl(a.valor)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* QR Code PIX da federação */}
          <div className="bg-gold/5 border border-gold/30 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-24 h-24 bg-fht-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="font-body text-night text-[10px] text-center px-2">QR Code PIX FHT</span>
            </div>
            <div>
              <p className="font-body text-gray-soft text-xs uppercase tracking-wider">Total a pagar</p>
              <p className="font-display text-fht-white text-3xl leading-none my-1">{brl(total)}</p>
              <p className="font-body text-gray-soft text-xs">
                {marcados.size} {marcados.size === 1 ? 'atleta' : 'atletas'} × {brl(pendentes.valorUnitario)}
              </p>
            </div>
          </div>

          <div>
            <span className={lbl}>Comprovante do Pix *</span>
            <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-body cursor-pointer transition-colors duration-250 ${
              comprovante ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-federation/20 bg-[#0d1b2a]/80 text-gray-soft hover:border-gold/40'
            }`}>
              <input type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => setComprovante(e.target.files?.[0] ?? null)} />
              {comprovante
                ? <><CheckCircle size={16} /><span className="truncate">{comprovante.name}</span></>
                : <><Upload size={16} /><span>Selecionar comprovante</span></>}
            </label>
          </div>

          <div>
            <span className={lbl}>Observação <span className="normal-case tracking-normal">(opcional)</span></span>
            <input value={observacao} onChange={e => setObservacao(e.target.value)}
              className={inp} placeholder="Ex.: pagamento parcial, restante mês que vem" />
          </div>

          {erro && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="font-body text-red-400 text-sm">{erro}</p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-federation/20 flex justify-end gap-3">
          <button onClick={onClose} disabled={enviando}
            className="font-display text-gray-soft border border-federation/30 px-5 py-2.5 rounded-lg text-sm tracking-wider disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={enviar} disabled={enviando || marcados.size === 0 || !comprovante}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed">
            {enviando ? 'Enviando...' : `Enviar ${brl(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Meus Atletas ────────────────────────────────────────── */
function AtletasPage({ atletas, onCadastrar, onVer, onPago }: {
  atletas: AtletaDTO[]; onCadastrar: () => void; onVer: (a: AtletaDTO) => void; onPago: () => void
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

      <BarraPagamento onPago={onPago} />
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
    responsavelNome: atleta.responsavelNome ?? '',
    responsavelCpf: atleta.responsavelCpf ?? '',
    responsavelParentesco: atleta.responsavelParentesco ?? '',
    responsavelEmail: atleta.responsavelEmail ?? '',
    responsavelTelefone: atleta.responsavelTelefone ?? '',
    consentimentoCadastro: false,
  })

  // Menor sem o consentimento do responsável fica travado na aprovação — a edição é onde se regulariza.
  const precisaRegularizar = atleta.menorDeIdade
    && !atleta.consentimentos.some(c => c.finalidade === 'CADASTRO_ATLETA_MENOR' && !c.revogadoEm)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState<string | null>(null)

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  async function salvar() {
    setSaving(true); setErro('')
    try {
      // Campos do responsável só fazem sentido para menor — não sujar o cadastro do adulto.
      const {
        responsavelNome, responsavelCpf, responsavelParentesco, responsavelEmail,
        responsavelTelefone, consentimentoCadastro, ...dadosBase
      } = form
      const payload = atleta.menorDeIdade
        ? { ...dadosBase, responsavelNome, responsavelCpf, responsavelParentesco, responsavelEmail, responsavelTelefone, consentimentoCadastro }
        : dadosBase

      await apiPut(`/api/atletas/${atleta.id}`, payload)
      onSaved()
      onClose()
    } catch (e) {
      setErro(errMsg(e)); setSaving(false)
    }
  }

  /** Anexa um documento que faltou no cadastro. O Pix tira o atleta da fila de expurgo. */
  async function anexar(campo: string, file: File) {
    setEnviando(campo); setErro('')
    try {
      const fd = new FormData()
      fd.append(campo, file)
      await apiPostForm(`/api/atletas/${atleta.id}/documentos`, fd)
      onSaved()
      onClose()
    } catch (e) {
      setErro(errMsg(e)); setEnviando(null)
    }
  }

  const Info = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="font-body text-gray-soft text-xs uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-body text-fht-white text-sm">{value || '—'}</p>
    </div>
  )

  // O comprovante de pagamento saiu daqui: agora é um só, do lote pago pelo clube.
  const docs = [
    { label: 'Foto 3x4', url: atleta.fotoUrl, campo: 'foto', accept: 'image/*' },
    { label: 'RG digitalizado', url: atleta.rgUrl, campo: 'rgDoc', accept: '.pdf,image/*' },
    { label: 'Comprovante de residência', url: atleta.comprovanteResidenciaUrl, campo: 'comprovanteResidencia', accept: '.pdf,image/*' },
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

          {atleta.status === 'AGUARDANDO_PAGAMENTO' && (
            <div className="flex items-start gap-3 rounded-lg px-4 py-3 border bg-yellow-500/10 border-yellow-500/30">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-yellow-400" />
              <div>
                <p className="font-display text-sm text-yellow-400">Anuidade pendente</p>
                <p className="font-body text-gray-soft text-xs mt-1 leading-relaxed">
                  Este atleta entra no próximo pagamento do clube. Use o botão de pagamento na aba
                  <span className="text-fht-white"> Meus Atletas</span> para quitar a anuidade de todos de uma vez.
                </p>
              </div>
            </div>
          )}

          {precisaRegularizar && !editing && (
            <div className="flex items-start gap-3 bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-purple-400 text-sm">Falta o consentimento do responsável</p>
                <p className="font-body text-gray-soft text-xs mt-1 leading-relaxed">
                  Atleta menor de idade sem o aceite do responsável legal registrado (LGPD art. 14) — a federação
                  não consegue aprovar. Clique em <span className="text-fht-white">Editar dados</span> para completar.
                </p>
              </div>
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
              {atleta.menorDeIdade && (
                <div className="flex flex-col gap-4 pt-4 border-t border-federation/20">
                  <p className="font-display text-purple-400 text-xs tracking-widest">RESPONSÁVEL LEGAL (LGPD ART. 14)</p>
                  <div>
                    <span className={lbl}>Nome do responsável</span>
                    <input name="responsavelNome" value={form.responsavelNome} onChange={change} className={inp} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={lbl}>CPF do responsável</span>
                      <input name="responsavelCpf" value={form.responsavelCpf}
                        onChange={e => setForm(p => ({ ...p, responsavelCpf: maskCPF(e.target.value) }))} className={inp} />
                    </div>
                    <div>
                      <span className={lbl}>Parentesco</span>
                      <select name="responsavelParentesco" value={form.responsavelParentesco} onChange={change} className={sel}>
                        <option value="">Selecione</option>
                        {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={lbl}>E-mail do responsável</span>
                      <input name="responsavelEmail" value={form.responsavelEmail} onChange={change} className={inp} />
                    </div>
                    <div>
                      <span className={lbl}>Telefone do responsável</span>
                      <input name="responsavelTelefone" value={form.responsavelTelefone}
                        onChange={e => setForm(p => ({ ...p, responsavelTelefone: maskPhone(e.target.value) }))} className={inp} />
                    </div>
                  </div>

                  {precisaRegularizar && (
                    <ConsentBox obrigatorio checked={form.consentimentoCadastro}
                      onChange={v => setForm(p => ({ ...p, consentimentoCadastro: v }))}
                      titulo="Autorização do responsável para a filiação">
                      Este cadastro não tem o consentimento do responsável registrado, e por isso a federação
                      não consegue aprová-lo. Marque para registrar o aceite do responsável legal e liberar a aprovação.
                    </ConsentBox>
                  )}
                </div>
              )}
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
              {atleta.menorDeIdade && (
                <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                  <p className="font-display text-gold text-xs tracking-widest mb-4">RESPONSÁVEL LEGAL</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Info label="Nome" value={atleta.responsavelNome ?? ''} />
                    <Info label="Parentesco" value={atleta.responsavelParentesco ?? ''} />
                    <Info label="CPF" value={atleta.responsavelCpf ?? ''} />
                    <Info label="Telefone" value={atleta.responsavelTelefone ?? ''} />
                    <Info label="E-mail" value={atleta.responsavelEmail ?? ''} />
                  </div>
                </div>
              )}

              {atleta.consentimentos.length > 0 && (
                <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                  <p className="font-display text-gold text-xs tracking-widest mb-4">CONSENTIMENTOS (LGPD)</p>
                  <div className="flex flex-col gap-2">
                    {atleta.consentimentos.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-federation/10 border border-federation/20 rounded-lg">
                        <div>
                          <p className="font-body text-fht-white text-sm">
                            {c.finalidade === 'CADASTRO_ATLETA_MENOR' ? 'Filiação autorizada pelo responsável' : 'Uso de imagem no site'}
                          </p>
                          <p className="font-body text-gray-soft text-xs mt-0.5">
                            {c.consentidoPorNome ?? '—'} · {fmtDate(c.concedidoEm)} · termo v{c.textoVersao}
                          </p>
                        </div>
                        <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${
                          c.revogadoEm ? 'text-gray-soft bg-federation/10 border-federation/30' : 'text-green-400 bg-green-500/10 border-green-500/30'
                        }`}>
                          {c.revogadoEm ? 'revogado' : 'ativo'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                <p className="font-display text-gold text-xs tracking-widest mb-4">DOCUMENTOS</p>
                <div className="flex flex-col gap-2">
                  {docs.map(({ label, url, campo, accept }) => url ? (
                    <a key={label} href={fileUrl(url)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 bg-federation/10 border border-federation/20 rounded-lg hover:border-gold/40 transition-colors duration-200">
                      <span className="font-body text-fht-white text-sm">{label}</span>
                      <span className="font-body text-gray-soft text-xs">Abrir →</span>
                    </a>
                  ) : (
                    <label key={label}
                      className="flex items-center justify-between px-4 py-3 bg-federation/5 border border-federation/10 rounded-lg cursor-pointer hover:border-gold/40 transition-colors duration-200">
                      <input type="file" accept={accept} className="hidden" disabled={enviando !== null}
                        onChange={e => { const f = e.target.files?.[0]; if (f) anexar(campo, f) }} />
                      <span className="font-body text-gray-soft text-sm">{label}</span>
                      <span className="font-body text-gold text-xs flex items-center gap-1.5">
                        <Upload size={12} />{enviando === campo ? 'enviando...' : 'Anexar'}
                      </span>
                    </label>
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
  const [foto, setFoto] = useState<File | null>(null)
  const [rgDoc, setRgDoc] = useState<File | null>(null)
  const [compRes, setCompRes] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle'|'loading'|'error'>('idle')
  const [errMessage, setErrMessage] = useState('')

  const menor = isMenorDeIdade(form.dataNascimento)
  const steps = menor ? STEPS_MENOR : STEPS_ADULTO
  // A etapa do responsável entra/sai conforme a data de nascimento — o índice fica preso ao fim.
  const stepIdx = Math.min(step, steps.length - 1)
  const etapa = steps[stepIdx]
  const ultimaEtapa = stepIdx === steps.length - 1

  // Espelha as validações server-side: bloqueia o avanço em vez de deixar o backend recusar.
  const respCpfValido = form.responsavelCpf.replace(/\D/g, '').length === 11 && validateCPF(form.responsavelCpf)
  const responsavelOk = !menor || (
    form.responsavelNome.trim() !== '' && respCpfValido && form.responsavelParentesco !== ''
    && (form.responsavelEmail.trim() !== '' || form.responsavelTelefone.trim() !== '')
    && form.consentimentoCadastro
  )
  const podeEnviar = rgDoc !== null && responsavelOk && form.posicoes.length > 0 && form.categoria !== ''

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === 'cpf') {
      const fmt = maskCPF(value)
      setForm(p => ({ ...p, cpf: fmt }))
      if (fmt.replace(/\D/g, '').length === 11) setCpfErr(validateCPF(fmt) ? '' : 'CPF inválido')
      else setCpfErr('')
      return
    }
    if (name === 'responsavelCpf') { setForm(p => ({ ...p, responsavelCpf: maskCPF(value) })); return }
    if (name === 'responsavelTelefone') { setForm(p => ({ ...p, responsavelTelefone: maskPhone(value) })); return }
    if (name === 'telefone') { setForm(p => ({ ...p, telefone: maskPhone(value) })); return }
    setForm(p => ({ ...p, [name]: value }))
  }

  function alternarPosicao(pos: string) {
    setForm(p => ({
      ...p,
      posicoes: p.posicoes.includes(pos) ? p.posicoes.filter(x => x !== pos) : [...p.posicoes, pos],
    }))
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
      // Endereço do atleta = endereço do clube; não é mais coletado no cadastro.
      data.append('posicao', form.posicoes.join(', '))
      data.append('categoria', form.categoria)
      data.append('isTransferencia', String(form.transferencia))
      if (form.transferencia) data.append('clubeAnterior', form.clubeAnterior)
      if (menor) {
        data.append('responsavelNome', form.responsavelNome)
        data.append('responsavelCpf', form.responsavelCpf)
        data.append('responsavelParentesco', form.responsavelParentesco)
        data.append('responsavelEmail', form.responsavelEmail)
        data.append('responsavelTelefone', form.responsavelTelefone)
        data.append('consentimentoCadastro', String(form.consentimentoCadastro))
      }
      data.append('consentimentoImagem', String(form.consentimentoImagem))
      if (foto) data.append('foto', foto)
      if (rgDoc) data.append('rgDoc', rgDoc)
      if (compRes) data.append('comprovanteResidencia', compRes)

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
        <StepBar steps={steps} step={stepIdx} />

        {/* Etapa 1 */}
        {etapa === 'pessoais' && (
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
                {menor && (
                  <p className="font-body text-gold text-xs mt-1.5">
                    Atleta menor de idade — será pedido o responsável legal
                  </p>
                )}
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
        {etapa === 'contato' && (
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
            <div className="flex items-start gap-3 bg-federation/10 border border-federation/30 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
              <p className="font-body text-gray-soft text-xs leading-relaxed">
                O endereço do atleta é o do próprio clube — não precisa ser informado aqui.
              </p>
            </div>
          </div>
        )}

        {/* Etapa 3 */}
        {etapa === 'esportivos' && (
          <div className="flex flex-col gap-4">
            <div>
              <span className={lbl}>
                Posições * <span className="normal-case tracking-normal">(pode marcar mais de uma)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {POSICOES.map(p => {
                  const ativo = form.posicoes.includes(p)
                  return (
                    <button key={p} type="button" onClick={() => alternarPosicao(p)}
                      className={`font-body text-xs px-3.5 py-2 rounded-full border transition-colors duration-150 ${
                        ativo ? 'text-gold bg-gold/10 border-gold/40'
                              : 'text-gray-soft bg-gray-soft/5 border-gray-soft/20 hover:border-gray-soft/50'
                      }`}>
                      {p}
                    </button>
                  )
                })}
              </div>
              {form.posicoes.length === 0 && (
                <p className="font-body text-gray-soft/70 text-xs mt-2">Selecione ao menos uma posição.</p>
              )}
            </div>
            <div>
              <span className={lbl}>Categoria *</span>
              <select required name="categoria" value={form.categoria} onChange={handleChange} className={sel}>
                <option value="" disabled>Selecione</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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

        {/* Etapa do responsável — só para menores (LGPD art. 14) */}
        {etapa === 'responsavel' && (
          <div className="flex flex-col gap-4">
            <div className="bg-federation/10 border border-federation/30 rounded-lg px-4 py-3">
              <p className="font-body text-gray-soft text-xs leading-relaxed">
                O atleta é <span className="text-fht-white">menor de 18 anos</span>. Pela LGPD (Lei 13.709/2018, art. 14),
                a filiação depende dos dados e do aceite de <span className="text-fht-white">um dos pais ou do responsável legal</span>.
              </p>
            </div>

            <div>
              <span className={lbl}>Nome do responsável legal *</span>
              <input required name="responsavelNome" value={form.responsavelNome} onChange={handleChange}
                placeholder="Nome completo do responsável" className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={lbl}>CPF do responsável *</span>
                <input required name="responsavelCpf" value={form.responsavelCpf} onChange={handleChange}
                  placeholder="000.000.000-00"
                  className={`${inp} ${form.responsavelCpf && !respCpfValido ? 'border-red-500' : ''}`} />
                {form.responsavelCpf && !respCpfValido && (
                  <p className="font-body text-red-400 text-xs mt-1">CPF inválido</p>
                )}
              </div>
              <div>
                <span className={lbl}>Parentesco *</span>
                <select required name="responsavelParentesco" value={form.responsavelParentesco} onChange={handleChange} className={sel}>
                  <option value="" disabled>Selecione</option>
                  {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={lbl}>E-mail do responsável</span>
                <input type="email" name="responsavelEmail" value={form.responsavelEmail} onChange={handleChange}
                  placeholder="responsavel@email.com" className={inp} />
              </div>
              <div>
                <span className={lbl}>Telefone do responsável</span>
                <input name="responsavelTelefone" value={form.responsavelTelefone} onChange={handleChange}
                  placeholder="(63) 99999-9999" className={inp} />
              </div>
            </div>
            <p className="font-body text-gray-soft text-xs -mt-2">Informe pelo menos um contato (e-mail ou telefone).</p>

            <div className="flex flex-col gap-3 mt-2">
              <ConsentBox obrigatorio checked={form.consentimentoCadastro}
                onChange={v => setForm(p => ({ ...p, consentimentoCadastro: v }))}
                titulo="Autorização do responsável para a filiação">
                Declaro ser o responsável legal pelo atleta e autorizo a FHT a tratar os dados pessoais dele
                (identificação, contato, endereço e documentos) para a finalidade de filiação, participação em
                competições e cumprimento das obrigações da federação. Posso solicitar acesso, correção ou
                exclusão dos dados a qualquer momento.
              </ConsentBox>

              <ConsentBox checked={form.consentimentoImagem}
                onChange={v => setForm(p => ({ ...p, consentimentoImagem: v }))}
                titulo="Autorização de uso de imagem (opcional)">
                Autorizo a publicação da foto e do nome do atleta no site da FHT, na galeria e em notícias.
                É opcional e pode ser revogada a qualquer momento — <span className="text-fht-white">a filiação
                continua válida sem esta autorização</span>.
              </ConsentBox>
            </div>
          </div>
        )}

        {/* Etapa final — documentos e pagamento */}
        {etapa === 'documentos' && (
          <div className="flex flex-col gap-4">
            <FileBtn file={rgDoc} onChange={setRgDoc} obrigatorio
              label="RG digitalizado (PDF ou imagem)" accept=".pdf,image/*" />
            <FileBtn file={foto} onChange={setFoto} label="Foto 3x4 digital" accept="image/*"
              hint="Pode ser anexada depois, pelo painel do clube." />
            <FileBtn file={compRes} onChange={setCompRes} label="Comprovante de residência (PDF ou imagem)"
              accept=".pdf,image/*" hint="Pode ser anexado depois, pelo painel do clube." />

            {/* Para menores este aceite fica na etapa do responsável, quem tem que consentir é ele. */}
            {!menor && (
              <ConsentBox checked={form.consentimentoImagem}
                onChange={v => setForm(p => ({ ...p, consentimentoImagem: v }))}
                titulo="Autorização de uso de imagem (opcional)">
                O atleta autoriza a publicação da foto e do nome no site da FHT, na galeria e em notícias.
                É opcional e pode ser revogada a qualquer momento — a filiação continua válida sem ela.
              </ConsentBox>
            )}

            <div className="flex items-start gap-3 bg-federation/10 border border-federation/30 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
              <p className="font-body text-gray-soft text-xs leading-relaxed">
                Não é preciso pagar agora. Cadastre todos os atletas e, quando quiser, use o
                <span className="text-fht-white"> botão de pagamento</span> na aba Meus Atletas para
                quitar a anuidade de todos de uma vez, com um comprovante só.
              </p>
            </div>

            {!rgDoc && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="font-body text-red-400 text-sm">Anexe o RG digitalizado para concluir o cadastro.</p>
              </div>
            )}

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
          <button type="button" onClick={() => setStep(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}
            className="flex items-center gap-2 font-display text-gray-soft hover:text-fht-white border border-federation/20 hover:border-federation/50 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={16} /> ANTERIOR
          </button>
          {!ultimaEtapa ? (
            <button type="button" onClick={() => setStep(stepIdx + 1)} disabled={etapa === 'responsavel' && !responsavelOk}
              className="flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed">
              PRÓXIMO <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleFinalSubmit} disabled={status === 'loading' || !podeEnviar}
              className="font-display text-night bg-gold hover:bg-gold-light px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'loading' ? 'CADASTRANDO...' : 'CADASTRAR ATLETA'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Comissão técnica: representantes e técnico ──────────── */
const FUNCOES: { valor: FuncaoPessoa; label: string }[] = [
  { valor: 'REPRESENTANTE', label: 'Representante' },
  { valor: 'TECNICO', label: 'Técnico' },
  { valor: 'AUXILIAR', label: 'Auxiliar' },
]
const funcaoLabel = (f: string) => FUNCOES.find(x => x.valor === f)?.label ?? f

function EquipePage() {
  const { user } = useAuth()
  const clubeId = user?.clubeId
  const [pessoas, setPessoas] = useState<ClubePessoaDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<ClubePessoaDTO | null>(null)
  const [removendo, setRemovendo] = useState<ClubePessoaDTO | null>(null)

  const carregar = useCallback(async () => {
    if (!clubeId) return
    try {
      setPessoas(await apiGet<ClubePessoaDTO[]>(`/api/clubes/${clubeId}/pessoas`))
      setErro('')
    } catch (e) { setErro(errMsg(e)) } finally { setCarregando(false) }
  }, [clubeId])

  useEffect(() => { void carregar() }, [carregar])

  async function remover() {
    if (!removendo || !clubeId) return
    try {
      await apiDelete(`/api/clubes/${clubeId}/pessoas/${removendo.id}`)
      setRemovendo(null)
      await carregar()
    } catch (e) { setErro(errMsg(e)); setRemovendo(null) }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-display text-fht-white text-3xl">COMISSÃO TÉCNICA</h2>
          <p className="font-body text-gray-soft text-sm mt-1">
            Representantes e técnico do clube. O técnico é quem define a escalação nas competições.
          </p>
        </div>
        <button onClick={() => { setEditando(null); setModalAberto(true) }}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2">
          + ADICIONAR
        </button>
      </div>

      {erro && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="font-body text-red-400 text-sm">{erro}</p>
        </div>
      )}

      {carregando ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 text-center font-body text-gray-soft text-sm">
          Carregando...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {pessoas.map(p => (
            <div key={p.id} className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body text-xs px-2.5 py-1 rounded-full border text-blue-300 bg-blue-mid/10 border-blue-400/30">
                    {funcaoLabel(p.funcao)}
                  </span>
                  {p.principal && (
                    <span title="Responde pela filiação e é o dono do login"
                      className="font-body text-xs px-2.5 py-1 rounded-full border text-gold bg-gold/10 border-gold/30">
                      principal
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => { setEditando(p); setModalAberto(true) }}
                    className="font-body text-gray-soft text-xs hover:text-fht-white">Editar</button>
                  {!p.principal && (
                    <button onClick={() => setRemovendo(p)}
                      className="font-body text-gray-soft text-xs hover:text-red-400">Remover</button>
                  )}
                </div>
              </div>
              <p className="font-display text-fht-white text-lg leading-tight">{p.nome}</p>
              {p.cargo && <p className="font-body text-gray-soft text-sm mt-0.5">{p.cargo}</p>}
              <div className="flex flex-col gap-1 mt-3">
                {p.email && <p className="font-body text-gray-soft text-xs">{p.email}</p>}
                {p.telefone && <p className="font-body text-gray-soft text-xs">{p.telefone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && clubeId && (
        <PessoaModal clubeId={clubeId} editando={editando}
          onClose={() => { setModalAberto(false); setEditando(null) }}
          onSalvo={carregar} />
      )}

      {removendo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)' }} onClick={() => setRemovendo(null)}>
          <div className="bg-[#0a1628] border border-federation/30 rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-fht-white text-xl">REMOVER DA COMISSÃO?</h3>
            <p className="font-body text-gray-soft text-sm">
              <span className="text-fht-white">{removendo.nome}</span> deixa de constar na comissão técnica do clube.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRemovendo(null)}
                className="font-display text-gray-soft border border-federation/30 px-5 py-2.5 rounded-lg text-sm tracking-wider">
                Cancelar
              </button>
              <button onClick={remover}
                className="font-display text-fht-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 px-5 py-2.5 rounded-lg text-sm tracking-wider">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PessoaModal({ clubeId, editando, onClose, onSalvo }: {
  clubeId: string; editando: ClubePessoaDTO | null; onClose: () => void; onSalvo: () => void
}) {
  const [f, setF] = useState({
    nome: editando?.nome ?? '',
    cpf: editando?.cpf ?? '',
    funcao: (editando?.funcao ?? 'TECNICO') as FuncaoPessoa,
    cargo: editando?.cargo ?? '',
    email: editando?.email ?? '',
    telefone: editando?.telefone ?? '',
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    if (!f.nome.trim()) { setErro('Informe o nome.'); return }
    setSalvando(true); setErro('')
    try {
      if (editando) await apiPut(`/api/clubes/${clubeId}/pessoas/${editando.id}`, f)
      else await apiPostJson(`/api/clubes/${clubeId}/pessoas`, f)
      onSalvo()
      onClose()
    } catch (e) { setErro(errMsg(e)); setSalvando(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-federation/20 flex items-center justify-between">
          <h3 className="font-display text-fht-white text-xl tracking-wide">
            {editando ? 'EDITAR PESSOA' : 'ADICIONAR À COMISSÃO'}
          </h3>
          <button onClick={onClose} className="text-gray-soft hover:text-fht-white p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <span className={lbl}>Nome completo *</span>
            <input value={f.nome} onChange={e => setF(p => ({ ...p, nome: e.target.value }))}
              className={inp} placeholder="Nome" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className={lbl}>Função *</span>
              <select value={f.funcao} onChange={e => setF(p => ({ ...p, funcao: e.target.value as FuncaoPessoa }))}
                className={sel} disabled={editando?.principal}>
                {FUNCOES.map(x => <option key={x.valor} value={x.valor}>{x.label}</option>)}
              </select>
            </div>
            <div>
              <span className={lbl}>Cargo</span>
              <input value={f.cargo} onChange={e => setF(p => ({ ...p, cargo: e.target.value }))}
                className={inp} placeholder="Ex.: Técnico principal" />
            </div>
          </div>
          <div>
            <span className={lbl}>CPF</span>
            <input value={f.cpf} onChange={e => setF(p => ({ ...p, cpf: maskCPF(e.target.value) }))}
              className={inp} placeholder="000.000.000-00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className={lbl}>E-mail</span>
              <input value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))}
                className={inp} placeholder="email@clube.com" />
            </div>
            <div>
              <span className={lbl}>Telefone</span>
              <input value={f.telefone} onChange={e => setF(p => ({ ...p, telefone: maskPhone(e.target.value) }))}
                className={inp} placeholder="(63) 99999-9999" />
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="font-body text-red-400 text-sm">{erro}</p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-federation/20 flex justify-end gap-3">
          <button onClick={onClose} disabled={salvando}
            className="font-display text-gray-soft border border-federation/30 px-5 py-2.5 rounded-lg text-sm tracking-wider disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider disabled:opacity-50">
            {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Meus Dados (dados do clube — REAL, liga na API) ─────── */
function MeusDadosPage() {
  const { user } = useAuth()
  const clubeId = user?.clubeId

  const [clube, setClube] = useState<ClubeDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: '', cidade: '', uf: 'TO', sigla: '', cnpj: '',
    representanteNome: '', representanteEmail: '', representanteTelefone: '',
  })

  const fillForm = useCallback((dto: ClubeDTO) => setForm({
    nome: dto.nome,
    cidade: dto.cidade,
    uf: dto.uf,
    sigla: dto.sigla ?? '',
    cnpj: dto.cnpj ?? '',
    representanteNome: dto.representanteNome,
    representanteEmail: dto.representanteEmail,
    representanteTelefone: dto.representanteTelefone,
  }), [])

  const carregar = useCallback(async () => {
    if (!clubeId) { setLoading(false); return }
    setLoading(true); setErro('')
    try {
      const dto = await apiGet<ClubeDTO>(`/api/clubes/${clubeId}`)
      setClube(dto)
      fillForm(dto)
    } catch (e) {
      setErro(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [clubeId, fillForm])

  useEffect(() => { carregar() }, [carregar])

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === 'cnpj') { setForm(p => ({ ...p, cnpj: maskCNPJ(value) })); return }
    if (name === 'representanteTelefone') { setForm(p => ({ ...p, representanteTelefone: maskPhone(value) })); return }
    setForm(p => ({ ...p, [name]: value }))
  }

  async function salvar() {
    if (!clubeId) return
    setSaving(true); setErro('')
    try {
      await apiPut(`/api/clubes/${clubeId}`, form)
      setEditing(false)
      await carregar()
    } catch (e) {
      setErro(errMsg(e))
    } finally {
      setSaving(false)
    }
  }

  function cancelar() {
    if (clube) fillForm(clube)
    setEditing(false); setErro('')
  }

  const Info = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="font-body text-gray-soft text-xs uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-body text-fht-white text-sm">{value || '—'}</p>
    </div>
  )

  if (!clubeId) {
    return (
      <div>
        <h2 className="font-display text-fht-white text-3xl mb-6">MEUS DADOS</h2>
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-4">
          <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />
          <p className="font-body text-yellow-400 text-sm">Sua conta não está vinculada a nenhum clube. Contate a FHT.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <h2 className="font-display text-fht-white text-3xl mb-6">MEUS DADOS</h2>
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const hasUrl = (u: string | null | undefined): u is string => !!u && u !== '#'
  const docs = [
    { label: 'Ata de fundação', url: clube?.ataFundacaoUrl },
    { label: 'Estatuto social', url: clube?.estatutoUrl },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-fht-white text-3xl">MEUS DADOS</h2>
        {clube && (
          <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${clubeStatusBadge[clube.status]}`}>
            {clubeStatusLabel[clube.status]}
          </span>
        )}
      </div>

      {erro && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="font-body text-red-400 text-sm">{erro}</p>
        </div>
      )}

      {editing ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-6 flex flex-col gap-4">
          <div>
            <span className={lbl}>Nome do clube</span>
            <input name="nome" value={form.nome} onChange={change} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><span className={lbl}>Sigla</span><input name="sigla" value={form.sigla} onChange={change} placeholder="PHC" className={inp} /></div>
            <div><span className={lbl}>CNPJ</span><input name="cnpj" value={form.cnpj} onChange={change} placeholder="00.000.000/0000-00" className={inp} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><span className={lbl}>Cidade</span><input name="cidade" value={form.cidade} onChange={change} className={inp} /></div>
            <div>
              <span className={lbl}>UF</span>
              <select name="uf" value={form.uf} onChange={change} className={sel}>
                {UFS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="h-px bg-federation/20 my-1" />
          <p className="font-display text-gold text-xs tracking-widest">REPRESENTANTE LEGAL</p>
          <div><span className={lbl}>Nome do representante</span><input name="representanteNome" value={form.representanteNome} onChange={change} className={inp} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><span className={lbl}>E-mail</span><input name="representanteEmail" value={form.representanteEmail} onChange={change} className={inp} /></div>
            <div><span className={lbl}>Telefone</span><input name="representanteTelefone" value={form.representanteTelefone} onChange={change} placeholder="(63) 99999-9999" className={inp} /></div>
          </div>
          <p className="font-body text-gray-soft/60 text-xs">Status e documentos não são editáveis aqui — fale com a FHT.</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={salvar} disabled={saving}
              className="flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-50">
              <Save size={16} /> {saving ? 'SALVANDO...' : 'SALVAR'}
            </button>
            <button onClick={cancelar} disabled={saving}
              className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
              CANCELAR
            </button>
          </div>
        </div>
      ) : clube && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-gold" />
              <p className="font-display text-gold text-xs tracking-widest">IDENTIFICAÇÃO</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Info label="Nome" value={clube.nome} />
              <Info label="Sigla" value={clube.sigla ?? ''} />
              <Info label="CNPJ" value={clube.cnpj ?? ''} />
              <Info label="Cidade / UF" value={`${clube.cidade} / ${clube.uf}`} />
            </div>
          </div>

          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-gold" />
              <p className="font-display text-gold text-xs tracking-widest">REPRESENTANTE LEGAL</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Info label="Nome" value={clube.representanteNome} />
              <Info label="E-mail" value={clube.representanteEmail} />
              <Info label="Telefone" value={clube.representanteTelefone} />
            </div>
          </div>

          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-gold" />
              <p className="font-display text-gold text-xs tracking-widest">DOCUMENTOS</p>
            </div>
            <div className="flex flex-col gap-2">
              {docs.map(({ label, url }) => hasUrl(url) ? (
                <a key={label} href={fileUrl(url)} target="_blank" rel="noopener noreferrer"
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

          <button onClick={() => setEditing(true)}
            className="self-start flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
            <Edit3 size={16} /> EDITAR DADOS
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Inscrições em competições ────────────────────────────
   Bloco removido: era mock navegável (4 campeonatos inventados) que escalava atletas REAIS e
   devolvia selo verde "Inscrito", sem nada sair do navegador. Volta com a Fatia 3 do módulo de
   Competições, consumindo as competições que o admin cadastrou de verdade.
   Ver docs/MODULO-COMPETICOES.md §9.                                                        */

/* ── Sidebar ─────────────────────────────────────────────── */
// "Inscrições" está fora do menu até a Fatia 3 de Competições existir no backend. A tela lista
// 4 campeonatos inventados — que nem batem com os reais cadastrados pelo admin —, deixa escalar
// atletas REAIS vindos da API e devolve selo verde "Inscrito · N atletas escalados" que some no
// F5. Um clube podia chegar no dia do jogo achando que estava inscrito.
// Ver docs/MODULO-COMPETICOES.md e docs/REQUISITOS-PENDENTES.md.
const NAV = [
  { id: 'dashboard', label: 'Dashboard',        Icon: Home,     disabled: false },
  { id: 'atletas',   label: 'Meus Atletas',     Icon: Users,    disabled: false },
  { id: 'cadastrar', label: 'Cadastrar Atleta', Icon: UserPlus, disabled: false },
  { id: 'equipe',    label: 'Comissão Técnica',  Icon: Contact,  disabled: false },
  { id: 'dados',     label: 'Meus Dados',        Icon: Settings, disabled: false },
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
              {page === 'atletas' && (
                <AtletasPage atletas={atletas} onCadastrar={() => setPage('cadastrar')}
                  onVer={setAtletaDetalhe} onPago={() => { reload(true).catch(() => {}) }} />
              )}
              {page === 'cadastrar' && <CadastrarAtletaPage onSuccess={handleAtletaSuccess} />}
              {page === 'equipe' && <EquipePage />}
              {page === 'dados' && <MeusDadosPage />}
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
