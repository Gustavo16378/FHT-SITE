import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Shield, Users, Star, Trophy, Newspaper,
  FileText, LogOut, Menu, X, AlertCircle, Search,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiGet, apiPatch, ApiError } from '../services/api'
import type { ClubeDTO, AtletaDTO, AdminDashboardDTO } from '../types/api'

/* ── tipos (view-model) ───────────────────────────────────────── */
type Page = 'dashboard' | 'clubes' | 'atletas' | 'arbitros' | 'competicoes' | 'noticias' | 'documentos'

type StatusClube = 'PENDENTE' | 'ATIVO' | 'REJEITADO' | 'SUSPENSO'
type StatusAtleta = 'AGUARDANDO_PAGAMENTO' | 'ATIVO' | 'REJEITADO' | 'SUSPENSO'
type StatusArbitro = 'PENDENTE' | 'CREDENCIADO' | 'REJEITADO'

interface Clube {
  id: string; nome: string; sigla: string; cidade: string; uf: string; cnpj: string
  representante: string; representanteEmail: string; representanteTelefone: string
  status: StatusClube; data: string; ataUrl: string; estatutoUrl: string
  motivoRejeicao?: string
}
interface Atleta {
  id: string; nome: string; cpf: string; rg: string
  dataNascimento: string; sexo: 'M' | 'F'; telefone: string; email: string
  cidade: string; uf: string; clube: string; posicao: string; categoria: string
  status: StatusAtleta; transferencia: boolean; clubeAnterior?: string
  fotoUrl: string; rgUrl: string; comprovanteResidenciaUrl: string; comprovanteUrl: string
  motivoRejeicao?: string; taxaValor?: number; taxaAno?: number
}
interface Arbitro {
  id: number; nome: string; cidade: string; nivel: string; status: StatusArbitro
}

/* ── mapeadores DTO → view-model ──────────────────────────────── */
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
}

function mapClube(d: ClubeDTO): Clube {
  return {
    id: d.id,
    nome: d.nome,
    sigla: d.sigla ?? '',
    cidade: d.cidade,
    uf: d.uf,
    cnpj: d.cnpj ?? '',
    representante: d.representanteNome,
    representanteEmail: d.representanteEmail,
    representanteTelefone: d.representanteTelefone,
    status: d.status,
    data: formatDate(d.createdAt),
    ataUrl: d.ataFundacaoUrl ?? '#',
    estatutoUrl: d.estatutoUrl ?? '#',
    motivoRejeicao: d.motivoRejeicao ?? undefined,
  }
}

function mapAtleta(d: AtletaDTO, clubeNome: string): Atleta {
  const sexo: 'M' | 'F' = (d.sexo ?? '').toUpperCase().startsWith('M') ? 'M' : 'F'
  return {
    id: d.id,
    nome: d.nomeCompleto,
    cpf: d.cpf,
    rg: d.rg,
    dataNascimento: d.dataNascimento,
    sexo,
    telefone: d.telefone ?? '',
    email: d.email ?? '',
    cidade: d.cidade ?? '',
    uf: d.ufResidencia ?? '',
    clube: clubeNome,
    posicao: d.posicao,
    categoria: d.categoria,
    status: d.status,
    transferencia: d.transferencia,
    clubeAnterior: d.clubeAnterior ?? undefined,
    fotoUrl: d.fotoUrl ?? '#',
    rgUrl: d.rgUrl ?? '#',
    comprovanteResidenciaUrl: d.comprovanteResidenciaUrl ?? '#',
    comprovanteUrl: d.comprovantePagamentoUrl ?? '#',
    motivoRejeicao: d.motivoRejeicao ?? undefined,
    taxaValor: d.taxaValor ?? undefined,
    taxaAno: d.taxaAno ?? undefined,
  }
}

function errMsg(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return 'Ocorreu um erro inesperado.'
}

/* ── árbitros: ainda sem backend (estático / V2) ──────────────── */
const arbitrosMock: Arbitro[] = [
  { id: 1, nome: 'Fábio Martins', cidade: 'Palmas/TO', nivel: '', status: 'PENDENTE' },
  { id: 2, nome: 'Renata Alves', cidade: 'Porto Nacional/TO', nivel: 'Estadual B', status: 'CREDENCIADO' },
]

/* ── badge helpers ────────────────────────────────────────────── */
const clubeBadge: Record<StatusClube, string> = {
  PENDENTE:  'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  ATIVO:     'text-green-400 bg-green-500/10 border-green-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
  SUSPENSO:  'text-orange-400 bg-orange-500/10 border-orange-500/30',
}
const atletaBadge: Record<StatusAtleta, string> = {
  AGUARDANDO_PAGAMENTO: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  ATIVO: 'text-green-400 bg-green-500/10 border-green-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
  SUSPENSO: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
}
const arbitroBadge: Record<StatusArbitro, string> = {
  PENDENTE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  CREDENCIADO: 'text-green-400 bg-green-500/10 border-green-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
}

/* ── helpers estilo ───────────────────────────────────────────── */
const inp = 'font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250 w-full'
const sel = `${inp} appearance-none cursor-pointer`

/* ── faixa de erro reutilizável ───────────────────────────────── */
function ErrorBar({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null
  return (
    <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5">
      <div className="flex items-center gap-3">
        <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
        <p className="font-body text-red-400 text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-red-400/60 hover:text-red-400"><X size={16} /></button>
      )}
    </div>
  )
}

/* ── Modal de confirmação genérico ────────────────────────────── */
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

/* ── Search bar reutilizável ──────────────────────────────────── */
function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-5">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-soft pointer-events-none" />
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:w-80 font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250"
      />
    </div>
  )
}

/* ── Atleta Detail Panel ──────────────────────────────────────── */
function AtletaDetailPanel({
  atleta, onClose, onAprovar, onRejeitar, onSuspender, onReativar,
}: {
  atleta: Atleta
  onClose: () => void
  onAprovar: (id: string) => void
  onRejeitar: (id: string) => void
  onSuspender: (id: string) => void
  onReativar: (id: string) => void
}) {
  const Info = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="font-body text-gray-soft text-xs uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-body text-fht-white text-sm">{value || '—'}</p>
    </div>
  )

  const idade = atleta.dataNascimento
    ? Math.floor((Date.now() - new Date(atleta.dataNascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div className="w-full max-w-2xl h-full bg-[#0a1628] border-l border-federation/20 overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="flex items-start justify-between p-6 border-b border-federation/20 sticky top-0 bg-[#0a1628] z-10">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-xl bg-federation/20 border border-federation/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {atleta.fotoUrl && atleta.fotoUrl !== '#'
                ? <img src={atleta.fotoUrl} alt={atleta.nome} className="w-full h-full object-cover" />
                : <Users size={24} className="text-gray-soft" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`font-body text-xs px-2.5 py-0.5 rounded-full border ${atletaBadge[atleta.status]}`}>
                  {atleta.status === 'AGUARDANDO_PAGAMENTO' ? 'AG. PAGAMENTO' : atleta.status}
                </span>
                {atleta.transferencia && (
                  <span className="font-body text-xs px-2 py-0.5 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/30">TRANSFERÊNCIA</span>
                )}
              </div>
              <h2 className="font-display text-fht-white text-xl leading-tight">{atleta.nome}</h2>
              <p className="font-body text-gray-soft text-sm">{atleta.posicao} · {atleta.categoria} · {atleta.clube}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-soft hover:text-gold transition-colors duration-250 mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-6">

          {/* motivo rejeição */}
          {atleta.status === 'REJEITADO' && atleta.motivoRejeicao && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-red-400 text-xs uppercase tracking-wider mb-0.5">Motivo da rejeição</p>
                <p className="font-body text-red-300 text-sm">{atleta.motivoRejeicao}</p>
              </div>
            </div>
          )}

          {/* transferência */}
          {atleta.transferencia && atleta.clubeAnterior && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="font-body text-blue-400 text-xs uppercase tracking-wider mb-0.5">Transferência</p>
              <p className="font-body text-fht-white text-sm">Clube anterior: <span className="text-blue-300">{atleta.clubeAnterior}</span></p>
            </div>
          )}

          {/* dados pessoais */}
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <p className="font-display text-gold text-xs tracking-widest mb-4">DADOS PESSOAIS</p>
            <div className="grid grid-cols-2 gap-4">
              <Info label="CPF" value={atleta.cpf} />
              <Info label="RG" value={atleta.rg} />
              <Info label="Nascimento" value={atleta.dataNascimento ? `${new Date(atleta.dataNascimento).toLocaleDateString('pt-BR')} ${idade ? `(${idade} anos)` : ''}` : '—'} />
              <Info label="Sexo" value={atleta.sexo === 'M' ? 'Masculino' : 'Feminino'} />
              <Info label="Telefone" value={atleta.telefone} />
              <Info label="E-mail" value={atleta.email} />
              <Info label="Cidade / UF" value={`${atleta.cidade} / ${atleta.uf}`} />
            </div>
          </div>

          {/* dados esportivos */}
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <p className="font-display text-gold text-xs tracking-widest mb-4">DADOS ESPORTIVOS</p>
            <div className="grid grid-cols-2 gap-4">
              <Info label="Clube" value={atleta.clube} />
              <Info label="Posição" value={atleta.posicao} />
              <Info label="Categoria" value={atleta.categoria} />
              {atleta.taxaValor && <Info label="Taxa de filiação" value={`R$ ${atleta.taxaValor.toFixed(2)} — ${atleta.taxaAno}`} />}
            </div>
          </div>

          {/* documentos */}
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <p className="font-display text-gold text-xs tracking-widest mb-4">DOCUMENTOS</p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Foto 3x4', url: atleta.fotoUrl },
                { label: 'RG digitalizado', url: atleta.rgUrl },
                { label: 'Comprovante de residência', url: atleta.comprovanteResidenciaUrl },
                { label: 'Comprovante de pagamento Pix', url: atleta.comprovanteUrl },
              ].map(({ label, url }) => {
                const ok = url && url !== '#'
                return ok ? (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 bg-federation/10 border border-federation/20 rounded-lg hover:border-gold/40 transition-colors duration-200 group">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gold/60 group-hover:text-gold transition-colors duration-200" />
                      <span className="font-body text-fht-white text-sm">{label}</span>
                    </div>
                    <span className="font-body text-gray-soft text-xs group-hover:text-gold transition-colors duration-200">Abrir →</span>
                  </a>
                ) : (
                  <div key={label}
                    className="flex items-center justify-between px-4 py-3 bg-federation/5 border border-federation/10 rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gray-soft" />
                      <span className="font-body text-gray-soft text-sm">{label}</span>
                    </div>
                    <span className="font-body text-gray-soft text-xs">não enviado</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ações fixas no rodapé */}
        <div className="sticky bottom-0 bg-[#0a1628] border-t border-federation/20 p-5 flex flex-wrap gap-3">
          {atleta.status === 'AGUARDANDO_PAGAMENTO' && (
            <>
              <button onClick={() => onAprovar(atleta.id)}
                className="flex-1 font-display text-night bg-green-500 hover:bg-green-400 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
                APROVAR
              </button>
              <button onClick={() => onRejeitar(atleta.id)}
                className="flex-1 font-display text-fht-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
                REJEITAR
              </button>
            </>
          )}
          {atleta.status === 'ATIVO' && (
            <button onClick={() => onSuspender(atleta.id)}
              className="flex-1 font-display text-orange-400 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
              SUSPENDER ATLETA
            </button>
          )}
          {atleta.status === 'SUSPENSO' && (
            <button onClick={() => onReativar(atleta.id)}
              className="flex-1 font-display text-green-400 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
              REATIVAR ATLETA
            </button>
          )}
          <button onClick={onClose}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
            FECHAR
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Clube Detail Panel ───────────────────────────────────────── */
function ClubeDetailPanel({
  clube, atletas, onClose, onAprovar, onRejeitar, onSuspender, onReativar,
}: {
  clube: Clube
  atletas: Atleta[]
  onClose: () => void
  onAprovar: (id: string) => void
  onRejeitar: (id: string) => void
  onSuspender: (id: string) => void
  onReativar: (id: string) => void
}) {
  const atletasDoClube = atletas.filter(a => a.clube === clube.nome)

  const Info = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="font-body text-gray-soft text-xs uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-body text-fht-white text-sm">{value || '—'}</p>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* backdrop */}
      <div className="flex-1 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />

      {/* painel */}
      <div className="w-full max-w-2xl h-full bg-[#0a1628] border-l border-federation/20 overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="flex items-start justify-between p-6 border-b border-federation/20 sticky top-0 bg-[#0a1628] z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-display text-gold text-xs tracking-widest bg-gold/10 border border-gold/30 px-2 py-0.5 rounded">
                {clube.sigla || '—'}
              </span>
              <span className={`font-body text-xs px-2.5 py-0.5 rounded-full border ${clubeBadge[clube.status]}`}>
                {clube.status}
              </span>
            </div>
            <h2 className="font-display text-fht-white text-2xl leading-tight">{clube.nome}</h2>
            <p className="font-body text-gray-soft text-sm">{clube.cidade}/{clube.uf} · Registrado em {clube.data}</p>
          </div>
          <button onClick={onClose} className="text-gray-soft hover:text-gold transition-colors duration-250 mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-6">

          {/* motivo rejeição */}
          {clube.status === 'REJEITADO' && clube.motivoRejeicao && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-red-400 text-xs uppercase tracking-wider mb-0.5">Motivo da rejeição</p>
                <p className="font-body text-red-300 text-sm">{clube.motivoRejeicao}</p>
              </div>
            </div>
          )}

          {/* informações gerais */}
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <p className="font-display text-gold text-xs tracking-widest mb-4">INFORMAÇÕES GERAIS</p>
            <div className="grid grid-cols-2 gap-4">
              <Info label="CNPJ" value={clube.cnpj} />
              <Info label="Cidade / UF" value={`${clube.cidade} / ${clube.uf}`} />
            </div>
          </div>

          {/* representante */}
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <p className="font-display text-gold text-xs tracking-widest mb-4">REPRESENTANTE LEGAL</p>
            <div className="grid grid-cols-1 gap-3">
              <Info label="Nome" value={clube.representante} />
              <Info label="E-mail" value={clube.representanteEmail} />
              <Info label="Telefone" value={clube.representanteTelefone} />
            </div>
          </div>

          {/* documentos */}
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <p className="font-display text-gold text-xs tracking-widest mb-4">DOCUMENTOS</p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Ata de Fundação', url: clube.ataUrl },
                { label: 'Estatuto Social', url: clube.estatutoUrl },
              ].map(({ label, url }) => {
                const ok = url && url !== '#'
                return ok ? (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 bg-federation/10 border border-federation/20 rounded-lg hover:border-gold/40 transition-colors duration-200 group">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gold/60 group-hover:text-gold transition-colors duration-200" />
                      <span className="font-body text-fht-white text-sm">{label}</span>
                    </div>
                    <span className="font-body text-gray-soft text-xs group-hover:text-gold transition-colors duration-200">Abrir PDF →</span>
                  </a>
                ) : (
                  <div key={label}
                    className="flex items-center justify-between px-4 py-3 bg-federation/5 border border-federation/10 rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gray-soft" />
                      <span className="font-body text-gray-soft text-sm">{label}</span>
                    </div>
                    <span className="font-body text-gray-soft text-xs">não enviado</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* estatísticas (mock até ter competições no backend) */}
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <p className="font-display text-gold text-xs tracking-widest mb-4">ESTATÍSTICAS</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: 'Jogos', v: 0 },
                { label: 'Vitórias', v: 0 },
                { label: 'Empates', v: 0 },
                { label: 'Derrotas', v: 0 },
              ].map(({ label, v }) => (
                <div key={label} className="bg-federation/10 border border-federation/20 rounded-lg py-3">
                  <p className="font-display text-fht-white text-2xl">{v}</p>
                  <p className="font-body text-gray-soft text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* atletas */}
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-gold text-xs tracking-widest">ATLETAS ({atletasDoClube.length})</p>
            </div>
            {atletasDoClube.length === 0 ? (
              <p className="font-body text-gray-soft text-sm text-center py-4">Nenhum atleta cadastrado ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {atletasDoClube.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-2.5 bg-federation/5 border border-federation/10 rounded-lg">
                    <div>
                      <p className="font-body text-fht-white text-sm">{a.nome}</p>
                      <p className="font-body text-gray-soft text-xs">{a.posicao} · {a.categoria}</p>
                    </div>
                    <span className={`font-body text-xs px-2 py-0.5 rounded-full border ${atletaBadge[a.status]}`}>
                      {a.status === 'AGUARDANDO_PAGAMENTO' ? 'AG. PGTO' : a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ações fixas no rodapé */}
        <div className="sticky bottom-0 bg-[#0a1628] border-t border-federation/20 p-5 flex flex-wrap gap-3">
          {clube.status === 'PENDENTE' && (
            <>
              <button onClick={() => onAprovar(clube.id)}
                className="flex-1 font-display text-night bg-green-500 hover:bg-green-400 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
                APROVAR
              </button>
              <button onClick={() => onRejeitar(clube.id)}
                className="flex-1 font-display text-fht-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
                REJEITAR
              </button>
            </>
          )}
          {clube.status === 'ATIVO' && (
            <button onClick={() => onSuspender(clube.id)}
              className="flex-1 font-display text-orange-400 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
              SUSPENDER CLUBE
            </button>
          )}
          {clube.status === 'SUSPENSO' && (
            <button onClick={() => onReativar(clube.id)}
              className="flex-1 font-display text-green-400 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
              REATIVAR CLUBE
            </button>
          )}
          <button onClick={onClose}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
            FECHAR
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard Page ───────────────────────────────────────────── */
function DashboardPage({ dashboard }: { dashboard: AdminDashboardDTO | null }) {
  const cards = [
    {
      group: 'Clubes', color: 'border-federation/40',
      items: [
        { label: 'Total', v: dashboard?.clubes.total ?? 0 },
        { label: 'Ativos', v: dashboard?.clubes.ativos ?? 0 },
        { label: 'Pendentes', v: dashboard?.clubes.pendentes ?? 0 },
      ],
    },
    {
      group: 'Atletas', color: 'border-gold/30',
      items: [
        { label: 'Total', v: dashboard?.atletas.total ?? 0 },
        { label: 'Ativos', v: dashboard?.atletas.ativos ?? 0 },
        { label: 'Ag. pagamento', v: dashboard?.atletas.pendentes ?? 0 },
      ],
    },
    {
      group: 'Usuários', color: 'border-blue-400/30',
      items: [
        { label: 'Total', v: dashboard?.usuarios ?? 0 },
      ],
    },
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

/* ── Clubes Page ──────────────────────────────────────────────── */
function ClubesPage({ clubes, atletas, reload }: {
  clubes: Clube[]; atletas: Atleta[]; reload: (silent?: boolean) => Promise<void>
}) {
  const [busca, setBusca] = useState('')
  const [detalhe, setDetalhe] = useState<Clube | null>(null)
  const [modal, setModal] = useState<{ type: 'rejeitar'; id: string } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const clubesFiltrados = clubes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.representante.toLowerCase().includes(busca.toLowerCase()) ||
    c.cidade.toLowerCase().includes(busca.toLowerCase())
  )

  async function acao(fn: () => Promise<void>) {
    setErro('')
    try {
      await fn()
      setDetalhe(null)
      await reload(true)
    } catch (e) {
      setErro(errMsg(e))
    }
  }

  const handleAprovar = (id: string) => acao(() => apiPatch(`/api/clubes/${id}/aprovar`))
  const handleSuspender = (id: string) => acao(() => apiPatch(`/api/clubes/${id}/suspender`))
  const handleReativar = (id: string) => acao(() => apiPatch(`/api/clubes/${id}/reativar`))

  function abrirRejeitar(id: string) {
    setDetalhe(null)
    setModal({ type: 'rejeitar', id })
  }

  async function handleRejeitar(id: string) {
    setErro('')
    try {
      await apiPatch(`/api/clubes/${id}/rejeitar`, { motivo })
      setMotivo('')
      setModal(null)
      await reload(true)
    } catch (e) {
      setErro(errMsg(e))
      setModal(null)
    }
  }

  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">CLUBES</h2>
      <ErrorBar message={erro} onClose={() => setErro('')} />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome, cidade ou representante..." />
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
            {clubesFiltrados.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center font-body text-gray-soft text-sm">Nenhum clube encontrado.</td></tr>
            ) : clubesFiltrados.map(c => (
              <tr key={c.id} className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150">
                <td className="px-4 py-3 font-body text-fht-white text-sm">{c.nome}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{c.cidade}/{c.uf}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{c.representante}</td>
                <td className="px-4 py-3">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${clubeBadge[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{c.data}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetalhe(c)}
                    className="font-body text-gold text-xs hover:underline">
                    Ver mais →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalhe && (
        <ClubeDetailPanel
          clube={detalhe}
          atletas={atletas}
          onClose={() => setDetalhe(null)}
          onAprovar={handleAprovar}
          onRejeitar={abrirRejeitar}
          onSuspender={handleSuspender}
          onReativar={handleReativar}
        />
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

/* ── Atletas Page ─────────────────────────────────────────────── */
function AtletasPage({ atletas, reload }: {
  atletas: Atleta[]; reload: (silent?: boolean) => Promise<void>
}) {
  const [busca, setBusca] = useState('')
  const [detalhe, setDetalhe] = useState<Atleta | null>(null)
  const [modal, setModal] = useState<{ type: 'rejeitar'; id: string } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')

  const atletasFiltrados = atletas.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.clube.toLowerCase().includes(busca.toLowerCase()) ||
    a.posicao.toLowerCase().includes(busca.toLowerCase()) ||
    a.cpf.includes(busca)
  )

  async function acao(fn: () => Promise<void>) {
    setErro('')
    try {
      await fn()
      setDetalhe(null)
      await reload(true)
    } catch (e) {
      setErro(errMsg(e))
    }
  }

  const handleAprovar = (id: string) => acao(() => apiPatch(`/api/atletas/${id}/aprovar`))
  const handleSuspender = (id: string) => acao(() => apiPatch(`/api/atletas/${id}/suspender`))
  const handleReativar = (id: string) => acao(() => apiPatch(`/api/atletas/${id}/reativar`))

  function abrirRejeitar(id: string) {
    setDetalhe(null)
    setModal({ type: 'rejeitar', id })
  }

  async function handleRejeitar(id: string) {
    setErro('')
    try {
      await apiPatch(`/api/atletas/${id}/rejeitar`, { motivo })
      setMotivo('')
      setModal(null)
      await reload(true)
    } catch (e) {
      setErro(errMsg(e))
      setModal(null)
    }
  }

  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">ATLETAS</h2>
      <ErrorBar message={erro} onClose={() => setErro('')} />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome, clube, posição ou CPF..." />
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-federation/20">
              {['Nome','Clube','Posição','Categoria','Status','Ações'].map(h => (
                <th key={h} className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {atletasFiltrados.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center font-body text-gray-soft text-sm">Nenhum atleta encontrado.</td></tr>
            ) : atletasFiltrados.map(a => (
              <tr key={a.id} className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150">
                <td className="px-4 py-3 font-body text-fht-white text-sm">{a.nome}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.clube}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.posicao}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{a.categoria}</td>
                <td className="px-4 py-3">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${atletaBadge[a.status]}`}>
                    {a.status === 'AGUARDANDO_PAGAMENTO' ? 'AG. PGTO' : a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetalhe(a)}
                    className="font-body text-gold text-xs hover:underline">Ver mais →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalhe && (
        <AtletaDetailPanel
          atleta={detalhe}
          onClose={() => setDetalhe(null)}
          onAprovar={handleAprovar}
          onRejeitar={abrirRejeitar}
          onSuspender={handleSuspender}
          onReativar={handleReativar}
        />
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

/* ── Árbitros Page (ainda sem backend — estado local) ─────────── */
const NIVEIS_APROVACAO = ['Regional', 'Estadual B', 'Estadual A', 'Nacional']

function ArbitrosPage() {
  const [arbitros, setArbitros] = useState<Arbitro[]>(arbitrosMock)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<{ type: 'aprovar' | 'rejeitar'; id: number } | null>(null)
  const [nivel, setNivel] = useState('')
  const [motivo, setMotivo] = useState('')
  const arbitrosFiltrados = arbitros.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.cidade.toLowerCase().includes(busca.toLowerCase())
  )

  // Sem endpoint de árbitros no backend ainda — muda só o estado local.
  function handleAprovar(id: number) {
    setArbitros(p => p.map(a => a.id === id ? { ...a, status: 'CREDENCIADO', nivel } : a))
    setNivel('')
    setModal(null)
  }

  function handleRejeitar(id: number) {
    setArbitros(p => p.map(a => a.id === id ? { ...a, status: 'REJEITADO' } : a))
    setMotivo('')
    setModal(null)
  }

  return (
    <div>
      <h2 className="font-display text-fht-white text-3xl mb-6">ÁRBITROS</h2>
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 mb-5">
        <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="font-body text-blue-300 text-sm">Módulo de árbitros ainda não está integrado à API — dados de demonstração.</p>
      </div>
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome ou cidade..." />
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
            {arbitrosFiltrados.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center font-body text-gray-soft text-sm">Nenhum árbitro encontrado.</td></tr>
            ) : arbitrosFiltrados.map(a => (
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

/* ── Placeholder V2 ───────────────────────────────────────────── */
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

/* ── Sidebar nav ──────────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',  label: 'Dashboard',    Icon: LayoutDashboard, disabled: false },
  { id: 'clubes',     label: 'Clubes',        Icon: Shield,          disabled: false },
  { id: 'atletas',    label: 'Atletas',       Icon: Users,           disabled: false },
  { id: 'arbitros',   label: 'Árbitros',      Icon: Star,            disabled: false },
  { id: 'competicoes',label: 'Competições',   Icon: Trophy,          disabled: true },
  { id: 'noticias',   label: 'Notícias',      Icon: Newspaper,       disabled: true },
  { id: 'documentos', label: 'Documentos',    Icon: FileText,        disabled: true },
] as const

/* ── Main ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [sideOpen, setSideOpen] = useState(false)

  const [clubes, setClubes] = useState<Clube[]>([])
  const [atletas, setAtletas] = useState<Atleta[]>([])
  const [dashboard, setDashboard] = useState<AdminDashboardDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [clubesDTO, atletasDTO, dash] = await Promise.all([
        apiGet<ClubeDTO[]>('/api/clubes'),
        apiGet<AtletaDTO[]>('/api/atletas'),
        apiGet<AdminDashboardDTO>('/api/admin/dashboard'),
      ])
      const nomePorId = new Map(clubesDTO.map(c => [c.id, c.nome]))
      setClubes(clubesDTO.map(mapClube))
      setAtletas(atletasDTO.map(a => mapAtleta(a, nomePorId.get(a.clubeId) ?? '—')))
      setDashboard(dash)
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
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : loadError && page !== 'arbitros' ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertCircle size={40} className="text-red-400 mb-4" />
              <p className="font-display text-fht-white text-xl mb-2">Não foi possível carregar os dados</p>
              <p className="font-body text-gray-soft text-sm mb-5">{loadError}</p>
              <button onClick={() => reload().catch(() => {})}
                className="font-display text-night bg-gold hover:bg-gold-light px-6 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
                TENTAR NOVAMENTE
              </button>
            </div>
          ) : (
            <>
              {page === 'dashboard'   && <DashboardPage dashboard={dashboard} />}
              {page === 'clubes'      && <ClubesPage clubes={clubes} atletas={atletas} reload={reload} />}
              {page === 'atletas'     && <AtletasPage atletas={atletas} reload={reload} />}
              {page === 'arbitros'    && <ArbitrosPage />}
              {page === 'competicoes' && <PlaceholderPage title="COMPETIÇÕES" />}
              {page === 'noticias'    && <PlaceholderPage title="NOTÍCIAS" />}
              {page === 'documentos'  && <PlaceholderPage title="DOCUMENTOS" />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
