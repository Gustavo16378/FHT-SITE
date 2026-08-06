import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Trophy,
  Plus,
  X,
  Search,
  Check,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  ChevronDown,
  Award,
  Clock,
  Pencil,
  Trash2,
  UserCheck,
  CircleCheck,
  Play,
  Eye,
  IdCard,
  Flag,
  RotateCcw,
  TriangleAlert,
  EyeOff,
} from 'lucide-react';
import { apiDelete, apiGet, apiPatch, apiPostJson, apiPut, ApiError } from '../../services/api';
import type { CompeticaoCategoria, CompeticaoDTO, CompeticaoStatus } from '../../types/api';

// ————————————————————————————————————————————————————————————
// Tipos
// ————————————————————————————————————————————————————————————
type CompStatus = CompeticaoStatus;
type FiltroStatus = CompStatus | 'todos';
type PainelAba = 'chaveamento' | 'equipes' | 'checkin' | 'jogos';
type Posicao = 'Goleiro' | 'Ponta' | 'Armador' | 'Pivô' | 'Central';
type JogoStatus = 'Agendado' | 'Em andamento' | 'Encerrado';

interface Equipe {
  sigla: string;
  nome: string;
  cidade: string;
}

interface Atleta {
  id: number;
  nome: string;
  posicao: Posicao;
  categoria: string;
}

interface Elenco extends Equipe {
  atletas: Atleta[];
}

interface Confronto {
  id: string;
  aSigla: string | null;
  bSigla: string | null;
  placarA: number | null;
  placarB: number | null;
}

interface Bracket {
  quartas: Confronto[];
  semis: Confronto[];
  final: Confronto;
  campeao: string | null;
}

interface CheckinAtleta {
  id: number;
  nome: string;
  sigla: string;
  posicao: Posicao;
  categoria: string;
  cpf: string;
  rg: string;
  nascimento: string;
  presente: boolean;
}

interface Goleador {
  nome: string;
  gols: number;
}

interface Jogo {
  id: number;
  fase: string;
  mandante: string;
  visitante: string;
  placarM: number | null;
  placarV: number | null;
  horario: string;
  status: JogoStatus;
  golsMandante: Goleador[];
  golsVisitante: Goleador[];
}

interface DadosOperacionais {
  bracket: Bracket;
  elencos: Elenco[];
  checkin: CheckinAtleta[];
  jogos: Jogo[];
  dataDia: string;
}

/**
 * A competição vem da API (CompeticaoDTO). Os campos operacionais — elencos, chaveamento,
 * check-in e jogos — chegam nas próximas etapas do módulo; até lá as abas ficam vazias.
 */
type Competicao = CompeticaoDTO & {
  equipes?: Equipe[];
  dados?: DadosOperacionais;
};

// ————————————————————————————————————————————————————————————
// Metadados de status
// ————————————————————————————————————————————————————————————
const STATUS_META: Record<CompStatus, { label: string; badge: string }> = {
  EM_ANDAMENTO: { label: 'Em andamento', badge: 'text-green-400 bg-green-500/10 border-green-500/30' },
  INSCRICOES_ABERTAS: { label: 'Inscrições abertas', badge: 'text-gold bg-gold/10 border-gold/30' },
  EM_BREVE: { label: 'Em breve', badge: 'text-blue-300 bg-blue-mid/10 border-blue-400/30' },
  ENCERRADO: { label: 'Encerrado', badge: 'text-gray-soft bg-gray-soft/10 border-gray-soft/30' },
  ADIADO: { label: 'Adiado', badge: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  CANCELADO: { label: 'Cancelado', badge: 'text-red-400 bg-red-500/10 border-red-500/30' },
};

const FILTROS: { valor: FiltroStatus; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'EM_ANDAMENTO', label: 'Em andamento' },
  { valor: 'INSCRICOES_ABERTAS', label: 'Inscrições abertas' },
  { valor: 'EM_BREVE', label: 'Em breve' },
  { valor: 'ADIADO', label: 'Adiado' },
  { valor: 'ENCERRADO', label: 'Encerrado' },
];

/** Categorias aceitas pelo backend (CompeticaoServiceImpl.CATEGORIAS_VALIDAS). */
const CATEGORIAS_DISPONIVEIS: CompeticaoCategoria[] =
  ['sub-12', 'sub-14', 'sub-16', 'sub-18', 'adulto', 'master', 'feminino', 'masculino'];

function rotuloCategoria(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function fmtData(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function periodoDe(c: CompeticaoDTO): string {
  return `${fmtData(c.dataInicio)} — ${fmtData(c.dataFim)}`;
}

function localDe(c: CompeticaoDTO): string {
  const cidadeUf = [c.cidade, c.uf].filter(Boolean).join(', ');
  return [c.local, cidadeUf].filter(Boolean).join(' — ') || 'Local a definir';
}

function msgErro(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Erro inesperado. Tente novamente.';
}

const POS_BADGE: Record<Posicao, string> = {
  Goleiro: 'text-gold bg-gold/10 border-gold/30',
  Ponta: 'text-blue-300 bg-blue-mid/10 border-blue-400/30',
  Armador: 'text-green-400 bg-green-500/10 border-green-500/30',
  Pivô: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Central: 'text-gray-soft bg-gray-soft/10 border-gray-soft/30',
};

// ————————————————————————————————————————————————————————————
// Clubes do Tocantins (base de nomes por sigla)
// ————————————————————————————————————————————————————————————
const CLUBES: Record<string, { nome: string; cidade: string }> = {
  PLM: { nome: 'Palmas HC', cidade: 'Palmas' },
  ARA: { nome: 'Araguaína HC', cidade: 'Araguaína' },
  GUR: { nome: 'Gurupi EC', cidade: 'Gurupi' },
  PNH: { nome: 'Porto Nacional HC', cidade: 'Porto Nacional' },
  TCP: { nome: 'Tocantinópolis Hand', cidade: 'Tocantinópolis' },
  COL: { nome: 'Colinas HC', cidade: 'Colinas do Tocantins' },
  MIR: { nome: 'Miracema HC', cidade: 'Miracema do Tocantins' },
  PAR: { nome: 'Paraíso HC', cidade: 'Paraíso do Tocantins' },
};

const nomeClube = (sigla: string): string => CLUBES[sigla]?.nome ?? sigla;

// ————————————————————————————————————————————————————————————
// Helpers de UI
// ————————————————————————————————————————————————————————————
const SELO_DEMO = (
  <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
    demonstração
  </span>
);

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const a = partes[0]?.[0] ?? '';
  const b = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (a + b).toUpperCase();
}

function StatusBadge({ status }: { status: CompStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${meta.badge}`}>{meta.label}</span>
  );
}

function CategoriaTag({ label }: { label: string }) {
  return (
    <span className="font-body text-[11px] text-blue-300 bg-blue-mid/10 border border-blue-400/30 rounded-md px-2 py-0.5">
      {label}
    </span>
  );
}

function SiglaBox({ sigla, destaque }: { sigla: string; destaque?: boolean }) {
  return (
    <span
      className={`font-display tracking-wider rounded-md flex items-center justify-center shrink-0 border w-11 h-9 text-sm ${
        destaque ? 'text-gold bg-gold/10 border-gold/40' : 'text-gray-soft bg-federation/10 border-federation/20'
      }`}
    >
      {sigla}
    </span>
  );
}

function PosicaoTag({ posicao }: { posicao: Posicao }) {
  return (
    <span className={`font-body text-[11px] px-2 py-0.5 rounded-full border ${POS_BADGE[posicao]}`}>{posicao}</span>
  );
}

// ————————————————————————————————————————————————————————————
// Card da lista de competições
// ————————————————————————————————————————————————————————————
function CompeticaoCard({
  comp,
  onGerenciar,
  onEditar,
  onDeletar,
}: {
  comp: Competicao;
  onGerenciar: (c: Competicao) => void;
  onEditar: (c: Competicao) => void;
  onDeletar: (c: Competicao) => void;
}) {
  return (
    <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={comp.status} />
          {comp.statusOverride && (
            <span
              title="Status definido à mão — não acompanha mais as datas"
              className="font-body text-[10px] text-orange-400/80 border border-orange-500/30 rounded-full px-2 py-0.5"
            >
              manual
            </span>
          )}
          {!comp.visivelNaHome && (
            <span
              title="Não aparece no site público"
              className="font-body text-[10px] text-gray-soft/70 border border-federation/20 rounded-full px-2 py-0.5 flex items-center gap-1"
            >
              <EyeOff size={10} /> oculta
            </span>
          )}
          {comp.categorias.map((cat) => (
            <CategoriaTag key={cat} label={rotuloCategoria(cat)} />
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEditar(comp)}
            aria-label="Editar competição"
            className="text-gray-soft hover:text-fht-white p-2 rounded-lg hover:bg-federation/10 transition-colors duration-150"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDeletar(comp)}
            aria-label="Deletar competição"
            className="text-gray-soft hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors duration-150"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="font-display text-fht-white text-xl tracking-wide leading-tight">{comp.nome}</h3>

      <div className="flex flex-col gap-2">
        <p className="font-body text-gray-soft text-sm flex items-center gap-2">
          <Calendar size={15} className="text-gold shrink-0" />
          {periodoDe(comp)}
        </p>
        <p className="font-body text-gray-soft text-sm flex items-center gap-2">
          <MapPin size={15} className="text-gold shrink-0" />
          {localDe(comp)}
        </p>
        <p className="font-body text-gray-soft text-sm flex items-center gap-2">
          <Users size={15} className="text-gold shrink-0" />
          {comp.numeroEquipes} {comp.numeroEquipes === 1 ? 'equipe' : 'equipes'}
        </p>
      </div>

      <div className="flex items-center justify-end pt-1">
        <button
          onClick={() => onGerenciar(comp)}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
        >
          Gerenciar
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Estado vazio genérico (abas sem dados)
// ————————————————————————————————————————————————————————————
function EmptyTab({ icon, texto }: { icon: ReactNode; texto: string }) {
  return (
    <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-12 flex flex-col items-center gap-3">
      {icon}
      <p className="font-body text-gray-soft text-sm text-center max-w-sm">{texto}</p>
    </div>
  );
}

function SecaoTitulo({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-display text-gold text-xs tracking-widest flex items-center gap-2">
        {icon}
        {children}
      </p>
      {SELO_DEMO}
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// ABA 1 — Chaveamento (bracket de mata-mata)
// ————————————————————————————————————————————————————————————
function LinhaConfronto({
  sigla,
  placar,
  venceu,
  perdeu,
}: {
  sigla: string | null;
  placar: number | null;
  venceu: boolean;
  perdeu: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg ${venceu ? 'bg-gold/10' : ''} ${
        perdeu ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`font-display text-xs tracking-wider w-9 h-7 flex items-center justify-center rounded-md shrink-0 border ${
            venceu ? 'text-gold border-gold/40 bg-gold/10' : 'text-gray-soft border-federation/20 bg-federation/10'
          }`}
        >
          {sigla ?? '—'}
        </span>
        <span className={`font-body text-xs truncate ${venceu ? 'text-fht-white' : 'text-gray-soft'}`}>
          {sigla ? nomeClube(sigla) : 'A definir'}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {venceu && <Check size={13} className="text-green-400" />}
        <span className={`font-display text-base tracking-wider w-5 text-right ${venceu ? 'text-gold' : 'text-gray-soft'}`}>
          {placar !== null ? placar : '–'}
        </span>
      </div>
    </div>
  );
}

function ConfrontoCard({ c }: { c: Confronto }) {
  const decidido = c.placarA !== null && c.placarB !== null;
  const aVenceu = decidido && (c.placarA as number) > (c.placarB as number);
  const bVenceu = decidido && (c.placarB as number) > (c.placarA as number);
  return (
    <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-2 w-60">
      <LinhaConfronto sigla={c.aSigla} placar={c.placarA} venceu={aVenceu} perdeu={bVenceu} />
      <div className="h-px bg-federation/15 mx-2" />
      <LinhaConfronto sigla={c.bSigla} placar={c.placarB} venceu={bVenceu} perdeu={aVenceu} />
    </div>
  );
}

function ColunaFase({ titulo, confrontos }: { titulo: string; confrontos: Confronto[] }) {
  return (
    <div className="flex flex-col">
      <p className="font-display text-gold text-xs tracking-widest text-center mb-4">{titulo}</p>
      <div className="flex-1 flex flex-col justify-around gap-5">
        {confrontos.map((c) => (
          <ConfrontoCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}

function Conector({ nEsquerda }: { nEsquerda: number }) {
  // Final → Campeão: uma haste reta, centralizada verticalmente.
  if (nEsquerda <= 1) {
    return (
      <div className="flex items-center px-1">
        <span className="h-0.5 w-8 bg-federation/40" />
      </div>
    );
  }

  // Cada par de confrontos da fase da esquerda vira 1 colchete ")".
  const colchetes = Math.floor(nEsquerda / 2);
  return (
    <div className="flex flex-col px-1">
      {/* espaçador com a mesma altura do título das colunas, pra alinhar com o 1º confronto */}
      <p className="font-display text-xs tracking-widest mb-4 invisible" aria-hidden="true">
        .
      </p>
      <div className="flex-1 flex flex-col justify-around gap-5">
        {Array.from({ length: colchetes }, (_, i) => (
          <div key={i} className="flex-1 flex items-center">
            <span className="w-6 self-stretch flex flex-col">
              <span className="flex-1 border-r-2 border-b-2 border-federation/35 rounded-br-xl" />
              <span className="flex-1 border-r-2 border-t-2 border-federation/35 rounded-tr-xl" />
            </span>
            <span className="h-0.5 w-3 bg-federation/35" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CampeaoCard({ sigla }: { sigla: string | null }) {
  return (
    <div className="flex flex-col">
      <p className="font-display text-gold text-xs tracking-widest text-center mb-4">CAMPEÃO</p>
      <div className="flex-1 flex items-center">
        <div
          className={`w-56 rounded-xl p-6 flex flex-col items-center gap-2 border ${
            sigla ? 'border-gold/40 bg-gold/10' : 'border-federation/20 bg-[#0d1b2a]/60'
          }`}
        >
          <Trophy size={32} className={sigla ? 'text-gold' : 'text-gray-soft/40'} />
          {sigla ? (
            <>
              <span className="font-display text-gold text-3xl tracking-wider leading-none">{sigla}</span>
              <span className="font-body text-fht-white text-sm text-center">{nomeClube(sigla)}</span>
              <span className="font-body text-[11px] px-2.5 py-1 rounded-full border text-green-400 bg-green-500/10 border-green-500/30">
                Campeão estadual
              </span>
            </>
          ) : (
            <span className="font-body text-gray-soft text-sm text-center">A definir · final em disputa</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChaveamentoTab({ bracket }: { bracket: Bracket }) {
  return (
    <div className="flex flex-col gap-5">
      <SecaoTitulo icon={<Trophy size={14} />}>CHAVEAMENTO — MATA-MATA</SecaoTitulo>
      <div className="overflow-x-auto pb-4">
        <div className="flex items-stretch gap-3 min-w-max min-h-[540px]">
          <ColunaFase titulo="QUARTAS DE FINAL" confrontos={bracket.quartas} />
          <Conector nEsquerda={bracket.quartas.length} />
          <ColunaFase titulo="SEMIFINAIS" confrontos={bracket.semis} />
          <Conector nEsquerda={bracket.semis.length} />
          <ColunaFase titulo="FINAL" confrontos={[bracket.final]} />
          <Conector nEsquerda={1} />
          <CampeaoCard sigla={bracket.campeao} />
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// ABA 2 — Equipes & atletas (clubes expansíveis)
// ————————————————————————————————————————————————————————————
function EquipesTab({ elencos }: { elencos: Elenco[] }) {
  const [abertos, setAbertos] = useState<Set<string>>(new Set());

  if (elencos.length === 0) {
    return (
      <EmptyTab icon={<Users size={32} className="text-gray-soft/50" />} texto="A inscrição de equipes chega na próxima etapa do módulo de Competições. Ainda não é possível inscrever clubes pelo sistema." />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SecaoTitulo icon={<Users size={14} />}>{`EQUIPES PARTICIPANTES (${elencos.length})`}</SecaoTitulo>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {elencos.map((e) => {
          const open = abertos.has(e.sigla);
          return (
            <div key={e.sigla} className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-hidden self-start">
              <button
                onClick={() =>
                  setAbertos((prev) => {
                    const proximo = new Set(prev);
                    if (proximo.has(e.sigla)) proximo.delete(e.sigla);
                    else proximo.add(e.sigla);
                    return proximo;
                  })
                }
                className="w-full flex items-center justify-between gap-3 p-4 hover:bg-federation/5 transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <SiglaBox sigla={e.sigla} destaque />
                  <div className="min-w-0 text-left">
                    <p className="font-body text-fht-white text-sm truncate">{e.nome}</p>
                    <p className="font-body text-gray-soft text-xs flex items-center gap-1">
                      <MapPin size={11} />
                      {e.cidade}/TO
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-body text-xs text-gray-soft flex items-center gap-1">
                    <Users size={13} />
                    {e.atletas.length}
                  </span>
                  {open ? (
                    <ChevronDown size={16} className="text-gold" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-soft" />
                  )}
                </div>
              </button>

              {open && (
                <div className="border-t border-federation/15 p-3 flex flex-col gap-1.5">
                  {e.atletas.length === 0 ? (
                    <p className="font-body text-gray-soft text-xs text-center py-3">Escalação ainda não definida.</p>
                  ) : (
                    e.atletas.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-federation/5 transition-colors duration-150"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-federation/20 flex items-center justify-center font-display text-fht-white text-xs shrink-0">
                            {iniciais(a.nome)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-body text-fht-white text-sm truncate">{a.nome}</p>
                            <p className="font-body text-gray-soft text-[11px]">{a.categoria}</p>
                          </div>
                        </div>
                        <PosicaoTag posicao={a.posicao} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// ABA 3 — Check-in (dia do jogo)
// ————————————————————————————————————————————————————————————
function ResumoStat({
  valor,
  label,
  cor,
  icon,
}: {
  valor: number;
  label: string;
  cor: string;
  icon: ReactNode;
}) {
  return (
    <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-[140px]">
      <div className={cor}>{icon}</div>
      <div>
        <p className={`font-display text-3xl leading-none ${cor}`}>{valor}</p>
        <p className="font-body text-gray-soft text-xs uppercase tracking-wider mt-1.5">{label}</p>
      </div>
    </div>
  );
}

function DadoCred({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-[#0d1b2a]/70 border border-federation/20 rounded-lg px-3.5 py-2.5">
      <p className="font-body text-gray-soft text-[10px] uppercase tracking-widest">{label}</p>
      <p className="font-body text-fht-white text-sm mt-1">{valor}</p>
    </div>
  );
}

// Credencial do atleta — carteirinha para conferência visual no check-in
function CredencialModal({
  atleta,
  presente,
  onToggle,
  onClose,
}: {
  atleta: CheckinAtleta;
  presente: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0a1628] border border-federation/30 rounded-2xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-federation/20 flex items-center justify-between">
          <p className="font-display text-gold text-sm tracking-widest flex items-center gap-2">
            <IdCard size={18} />
            CREDENCIAL DO ATLETA
          </p>
          <button
            onClick={onClose}
            aria-label="Fechar credencial"
            className="text-gray-soft hover:text-fht-white p-1.5 rounded-lg hover:bg-federation/10 transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo — carteirinha */}
        <div className="p-6 flex flex-col items-center gap-4">
          {SELO_DEMO}
          <div className="w-32 h-32 rounded-2xl bg-federation/20 border-2 border-gold/40 flex items-center justify-center font-display text-fht-white text-5xl tracking-wider">
            {iniciais(atleta.nome)}
          </div>
          <div className="text-center">
            <h3 className="font-display text-fht-white text-2xl tracking-wide leading-tight">{atleta.nome}</h3>
            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              <span className="font-body text-gray-soft text-sm">
                {atleta.sigla} · {nomeClube(atleta.sigla)}
              </span>
              <PosicaoTag posicao={atleta.posicao} />
            </div>
          </div>

          <span
            className={`font-body text-xs px-3 py-1 rounded-full border ${
              presente
                ? 'text-green-400 bg-green-500/10 border-green-500/30'
                : 'text-orange-400 bg-orange-500/10 border-orange-500/30'
            }`}
          >
            {presente ? 'Presença confirmada' : 'Aguardando check-in'}
          </span>

          <div className="w-full grid grid-cols-2 gap-3 mt-1">
            <DadoCred label="CPF" valor={atleta.cpf} />
            <DadoCred label="RG" valor={atleta.rg} />
            <DadoCred label="Nascimento" valor={atleta.nascimento} />
            <DadoCred label="Categoria" valor={atleta.categoria} />
            <DadoCred label="Posição" valor={atleta.posicao} />
            <DadoCred label="Clube" valor={nomeClube(atleta.sigla)} />
          </div>
        </div>

        {/* Footer — conferência visual */}
        <div className="p-5 border-t border-federation/20 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onToggle}
            className={`font-display tracking-wider px-5 py-3 rounded-lg text-sm w-full sm:flex-1 flex items-center justify-center gap-2 transition-colors duration-250 ${
              presente
                ? 'text-green-400 bg-green-500/10 border border-green-500/40 hover:bg-green-500/20'
                : 'text-night bg-gold hover:bg-gold-light'
            }`}
          >
            {presente ? (
              <>
                <CircleCheck size={18} />
                Presente — desfazer
              </>
            ) : (
              <>
                <UserCheck size={18} />
                Confirmar presença
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-3 rounded-lg text-sm tracking-wider transition-colors duration-250 w-full sm:w-auto"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckinTab({ atletas, local, dia }: { atletas: CheckinAtleta[]; local: string; dia: string }) {
  const [busca, setBusca] = useState<string>('');
  const [credencial, setCredencial] = useState<CheckinAtleta | null>(null);
  const [presentes, setPresentes] = useState<Record<number, boolean>>(() => {
    const inicial: Record<number, boolean> = {};
    atletas.forEach((a) => {
      inicial[a.id] = a.presente;
    });
    return inicial;
  });

  if (atletas.length === 0) {
    return (
      <EmptyTab
        icon={<UserCheck size={32} className="text-gray-soft/50" />}
        texto="O check-in de atletas no dia do jogo chega na próxima etapa do módulo de Competições."
      />
    );
  }

  const total = atletas.length;
  const numPresentes = atletas.filter((a) => presentes[a.id]).length;
  const faltam = total - numPresentes;

  const q = busca.trim().toLowerCase();
  const filtrados =
    q === ''
      ? atletas
      : atletas.filter(
          (a) =>
            a.nome.toLowerCase().includes(q) ||
            a.sigla.toLowerCase().includes(q) ||
            nomeClube(a.sigla).toLowerCase().includes(q),
        );

  const toggle = (id: number) => setPresentes((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho do dia */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-fht-white text-2xl tracking-wide flex items-center gap-2">
            <UserCheck size={22} className="text-gold" />
            CHECK-IN DO DIA
          </h3>
          <div className="flex items-center gap-4 flex-wrap mt-2">
            <span className="font-body text-gray-soft text-sm flex items-center gap-1.5">
              <Calendar size={14} className="text-gold" />
              {dia}
            </span>
            <span className="font-body text-gray-soft text-sm flex items-center gap-1.5">
              <MapPin size={14} className="text-gold" />
              {local}
            </span>
          </div>
        </div>
        {SELO_DEMO}
      </div>

      <p className="font-body text-gray-soft text-sm -mt-2 max-w-2xl">
        Conferência visual na entrada — abra <span className="text-fht-white">Ver credencial</span> para comparar a foto
        e os dados do atleta com a pessoa na porta antes de confirmar a presença.
      </p>

      {/* Resumo do dia */}
      <div className="flex flex-wrap gap-3">
        <ResumoStat valor={total} label="Escalados" cor="text-fht-white" icon={<Users size={24} />} />
        <ResumoStat valor={numPresentes} label="Presentes" cor="text-green-400" icon={<CircleCheck size={24} />} />
        <ResumoStat valor={faltam} label="Faltam" cor="text-orange-400" icon={<Clock size={24} />} />
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={18} className="text-gray-soft absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar atleta ou clube..."
          className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg pl-11 pr-4 py-4 text-fht-white placeholder-gray-soft text-base outline-none w-full"
        />
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtrados.length === 0 ? (
          <p className="font-body text-gray-soft text-base text-center py-8">
            Nenhum atleta encontrado para “{busca}”.
          </p>
        ) : (
          filtrados.map((a) => {
            const pres = !!presentes[a.id];
            return (
              <div
                key={a.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-colors duration-150 flex-wrap ${
                  pres ? 'border-green-500/30 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/5'
                }`}
              >
                <button
                  onClick={() => setCredencial(a)}
                  className="flex items-center gap-4 min-w-0 flex-1 text-left"
                >
                  <span className="w-12 h-12 rounded-xl bg-federation/20 flex items-center justify-center font-display text-fht-white text-lg shrink-0">
                    {iniciais(a.nome)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-body text-fht-white text-base truncate">{a.nome}</p>
                      {!pres && (
                        <span className="font-body text-[11px] px-2 py-0.5 rounded-full border text-orange-400 bg-orange-500/10 border-orange-500/30">
                          aguardando
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-body text-gray-soft text-sm">
                        {a.sigla} · {nomeClube(a.sigla)}
                      </span>
                      <PosicaoTag posicao={a.posicao} />
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setCredencial(a)}
                    className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 hover:text-fht-white px-4 py-2.5 rounded-lg text-sm tracking-wider flex items-center gap-2 transition-colors duration-150"
                  >
                    <Eye size={16} />
                    Ver credencial
                  </button>
                  <button
                    onClick={() => toggle(a.id)}
                    className={`font-display text-sm tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors duration-150 ${
                      pres
                        ? 'text-green-400 bg-green-500/10 border border-green-500/40 hover:bg-green-500/20'
                        : 'text-night bg-gold hover:bg-gold-light'
                    }`}
                  >
                    {pres ? (
                      <>
                        <CircleCheck size={16} />
                        Presente
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        Confirmar
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {credencial && (
        <CredencialModal
          atleta={credencial}
          presente={!!presentes[credencial.id]}
          onToggle={() => toggle(credencial.id)}
          onClose={() => setCredencial(null)}
        />
      )}
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// ABA 4 — Jogos & placar (ao vivo)
// ————————————————————————————————————————————————————————————
function jogoBadge(status: JogoStatus): string {
  if (status === 'Em andamento') return 'text-green-400 bg-green-500/10 border-green-500/30';
  if (status === 'Agendado') return 'text-blue-300 bg-blue-mid/10 border-blue-400/30';
  return 'text-gray-soft bg-gray-soft/10 border-gray-soft/30';
}

function GolsColuna({ sigla, gols }: { sigla: string; gols: Goleador[] }) {
  const total = gols.reduce((s, g) => s + g.gols, 0);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <SiglaBox sigla={sigla} />
        <span className="font-body text-gray-soft text-xs">{total} gols</span>
      </div>
      <div className="flex flex-col gap-2">
        {gols.map((g) => (
          <div key={g.nome} className="flex items-center gap-2.5">
            <span className="font-display text-gold text-base w-7 text-center shrink-0">{g.gols}</span>
            <span className="font-body text-fht-white text-sm truncate">{g.nome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function JogoCard({ jogo }: { jogo: Jogo }) {
  const temPlacar = jogo.placarM !== null && jogo.placarV !== null;
  const mVenceu = temPlacar && (jogo.placarM as number) > (jogo.placarV as number);
  const vVenceu = temPlacar && (jogo.placarV as number) > (jogo.placarM as number);
  const temGols = jogo.golsMandante.length > 0 || jogo.golsVisitante.length > 0;
  return (
    <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-2xl p-5 lg:p-6 flex flex-col gap-5">
      {/* Fase + status */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-display text-gold text-base tracking-widest">{jogo.fase.toUpperCase()}</span>
        <div className="flex items-center gap-3">
          <span className="font-body text-gray-soft text-sm flex items-center gap-1.5">
            <Clock size={14} />
            {jogo.horario}
          </span>
          <span className={`font-body text-xs px-3 py-1 rounded-full border ${jogoBadge(jogo.status)}`}>
            {jogo.status}
          </span>
        </div>
      </div>

      {/* Placar */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center min-w-0">
          <SiglaBox sigla={jogo.mandante} destaque={mVenceu} />
          <span className={`font-body text-sm truncate max-w-full ${mVenceu ? 'text-fht-white' : 'text-gray-soft'}`}>
            {nomeClube(jogo.mandante)}
          </span>
        </div>
        <div className="flex items-center gap-3 px-1">
          <span className={`font-display text-4xl lg:text-5xl leading-none ${mVenceu ? 'text-gold' : 'text-fht-white'}`}>
            {jogo.placarM !== null ? jogo.placarM : '–'}
          </span>
          <span className="font-display text-gray-soft text-2xl">×</span>
          <span className={`font-display text-4xl lg:text-5xl leading-none ${vVenceu ? 'text-gold' : 'text-fht-white'}`}>
            {jogo.placarV !== null ? jogo.placarV : '–'}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center min-w-0">
          <SiglaBox sigla={jogo.visitante} destaque={vVenceu} />
          <span className={`font-body text-sm truncate max-w-full ${vVenceu ? 'text-fht-white' : 'text-gray-soft'}`}>
            {nomeClube(jogo.visitante)}
          </span>
        </div>
      </div>

      {/* Destaques / gols dos dois times */}
      {temGols ? (
        <div className="border-t border-federation/15 pt-4">
          <p className="font-display text-gold text-xs tracking-widest mb-3 flex items-center gap-2">
            <Award size={14} />
            DESTAQUES · GOLS
          </p>
          <div className="grid grid-cols-2 gap-4">
            <GolsColuna sigla={jogo.mandante} gols={jogo.golsMandante} />
            <GolsColuna sigla={jogo.visitante} gols={jogo.golsVisitante} />
          </div>
        </div>
      ) : (
        <p className="font-body text-gray-soft text-sm border-t border-federation/15 pt-4 text-center">
          Escalações definidas · aguardando início do jogo.
        </p>
      )}
    </div>
  );
}

function JogosTab({ jogosIniciais }: { jogosIniciais: Jogo[] }) {
  const [jogos, setJogos] = useState<Jogo[]>(jogosIniciais);
  const emAndamento = jogos.find((j) => j.status === 'Em andamento') ?? null;
  const [pm, setPm] = useState<string>(emAndamento ? String(emAndamento.placarM ?? '') : '');
  const [pv, setPv] = useState<string>(emAndamento ? String(emAndamento.placarV ?? '') : '');

  if (jogos.length === 0) {
    return (
      <EmptyTab icon={<Play size={32} className="text-gray-soft/50" />} texto="A tabela de jogos e os placares chegam na próxima etapa do módulo de Competições." />
    );
  }

  const salvar = () => {
    if (!emAndamento) return;
    setJogos((prev) =>
      prev.map((j) =>
        j.id === emAndamento.id
          ? { ...j, placarM: pm === '' ? 0 : Number(pm), placarV: pv === '' ? 0 : Number(pv) }
          : j,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <SecaoTitulo icon={<Play size={14} />}>JOGOS & PLACAR AO VIVO</SecaoTitulo>

      {/* Bloco de lançar placar */}
      {emAndamento && (
        <div className="bg-[#0d1b2a]/60 border border-green-500/30 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="font-display text-green-400 text-base tracking-widest flex items-center gap-2">
              <Play size={16} />
              LANÇAR PLACAR — AO VIVO
            </p>
            <span className="font-body text-gray-soft text-sm flex items-center gap-1.5">
              <Clock size={14} />
              {emAndamento.fase} · {emAndamento.horario}
            </span>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <span className="font-body text-gray-soft text-sm uppercase tracking-wider mb-2 block">
                {emAndamento.mandante} · {nomeClube(emAndamento.mandante)}
              </span>
              <input
                type="number"
                min={0}
                value={pm}
                onChange={(e) => setPm(e.target.value)}
                placeholder="0"
                className="font-display bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-4 text-fht-white placeholder-gray-soft text-2xl outline-none w-full text-center"
              />
            </div>
            <span className="font-display text-gray-soft text-2xl pb-3">×</span>
            <div className="flex-1">
              <span className="font-body text-gray-soft text-sm uppercase tracking-wider mb-2 block">
                {emAndamento.visitante} · {nomeClube(emAndamento.visitante)}
              </span>
              <input
                type="number"
                min={0}
                value={pv}
                onChange={(e) => setPv(e.target.value)}
                placeholder="0"
                className="font-display bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-4 text-fht-white placeholder-gray-soft text-2xl outline-none w-full text-center"
              />
            </div>
          </div>
          <button
            onClick={salvar}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-3 rounded-lg text-base tracking-wider transition-colors duration-250 flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Salvar placar
          </button>
        </div>
      )}

      {/* Lista de jogos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {jogos.map((j) => (
          <JogoCard key={j.id} jogo={j} />
        ))}
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Painel operacional em TELA CHEIA (dia do campeonato)
// ————————————————————————————————————————————————————————————
function PainelFullscreen({
  comp,
  onClose,
  onEditar,
  onAtualizado,
}: {
  comp: Competicao;
  onClose: () => void;
  onEditar: () => void;
  onAtualizado: (c: Competicao) => void;
}) {
  const [aba, setAba] = useState<PainelAba>('chaveamento');
  const [confirmarEncerrar, setConfirmarEncerrar] = useState<boolean>(false);
  const [aplicando, setAplicando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const status = comp.status;
  const dados = comp.dados ?? null;
  const elencos: Elenco[] = dados ? dados.elencos : (comp.equipes ?? []).map((e) => ({ ...e, atletas: [] }));

  /** Grava o override de status; `null` devolve a competição ao status automático das datas. */
  async function aplicarStatus(novo: CompeticaoStatus | null) {
    setAplicando(true);
    setErroAcao('');
    try {
      const atualizada = novo === null
        ? await apiPatch<CompeticaoDTO>(`/api/competicoes/${comp.id}/status-automatico`)
        : await apiPatch<CompeticaoDTO>(`/api/competicoes/${comp.id}/status`, { status: novo });
      onAtualizado({ ...comp, ...atualizada });
    } catch (e) {
      setErroAcao(msgErro(e));
    } finally {
      setAplicando(false);
    }
  }

  async function alternarVitrine() {
    setAplicando(true);
    setErroAcao('');
    try {
      const atualizada = await apiPatch<CompeticaoDTO>(
        `/api/competicoes/${comp.id}/vitrine`, { visivel: !comp.visivelNaHome });
      onAtualizado({ ...comp, ...atualizada });
    } catch (e) {
      setErroAcao(msgErro(e));
    } finally {
      setAplicando(false);
    }
  }

  const btnPrimario =
    'font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2';
  const btnSecundario =
    'font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2';

  const abas: { valor: PainelAba; label: string; icon: ReactNode }[] = [
    { valor: 'chaveamento', label: 'CHAVEAMENTO', icon: <Trophy size={15} /> },
    { valor: 'equipes', label: 'EQUIPES & ATLETAS', icon: <Users size={15} /> },
    { valor: 'checkin', label: 'CHECK-IN', icon: <UserCheck size={15} /> },
    { valor: 'jogos', label: 'JOGOS & PLACAR', icon: <Play size={15} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#070D1E] flex flex-col">
      {/* Header */}
      <div className="border-b border-federation/20 px-6 lg:px-8 py-4 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Trophy size={20} className="text-gold shrink-0" />
            <StatusBadge status={status} />
            {comp.statusOverride && (
              <button
                onClick={() => aplicarStatus(null)}
                disabled={aplicando}
                title="Voltar a calcular o status pelas datas"
                className="font-body text-[10px] text-orange-400/90 border border-orange-500/30 hover:border-orange-500/60 rounded-full px-2 py-0.5 transition-colors duration-150 disabled:opacity-50"
              >
                manual · voltar ao automático
              </button>
            )}
          </div>
          <h2 className="font-display text-fht-white text-2xl lg:text-3xl tracking-wide leading-none">{comp.nome}</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="font-body text-gray-soft text-xs flex items-center gap-1.5">
              <MapPin size={13} className="text-gold" />
              {localDe(comp)}
            </p>
            <p className="font-body text-gray-soft text-xs flex items-center gap-1.5">
              <Calendar size={13} className="text-gold" />
              {periodoDe(comp)}
            </p>
          </div>
          {erroAcao && <p className="font-body text-red-400 text-xs">{erroAcao}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Ações de ciclo de vida — variam conforme o status atual */}
          {status === 'EM_BREVE' && (
            <button onClick={() => aplicarStatus('INSCRICOES_ABERTAS')} disabled={aplicando} className={btnPrimario}>
              <Flag size={16} />
              Abrir inscrições
            </button>
          )}
          {status === 'INSCRICOES_ABERTAS' && (
            <button onClick={() => aplicarStatus('EM_ANDAMENTO')} disabled={aplicando} className={btnPrimario}>
              <Play size={16} />
              Encerrar inscrições e iniciar campeonato
            </button>
          )}
          {status === 'EM_ANDAMENTO' && (
            <button onClick={() => setConfirmarEncerrar(true)} disabled={aplicando} className={btnPrimario}>
              <CircleCheck size={16} />
              Encerrar campeonato
            </button>
          )}
          {(status === 'ADIADO' || status === 'CANCELADO') && (
            <button onClick={() => aplicarStatus(null)} disabled={aplicando} className={btnPrimario}>
              <RotateCcw size={16} />
              Retomar
            </button>
          )}
          {status !== 'ENCERRADO' && status !== 'ADIADO' && status !== 'CANCELADO' && (
            <button onClick={() => aplicarStatus('ADIADO')} disabled={aplicando} className={btnSecundario}>
              <Clock size={16} />
              Adiar
            </button>
          )}

          <button onClick={alternarVitrine} disabled={aplicando} className={btnSecundario}
            title={comp.visivelNaHome ? 'Deixar de exibir no site público' : 'Exibir no site público'}>
            {comp.visivelNaHome ? <EyeOff size={16} /> : <Eye size={16} />}
            {comp.visivelNaHome ? 'Ocultar do site' : 'Mostrar no site'}
          </button>

          <button
            onClick={onEditar}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 hidden sm:flex items-center gap-2"
          >
            <Pencil size={16} />
            Editar competição
          </button>
          <button
            onClick={onClose}
            aria-label="Fechar painel"
            className="text-gray-soft hover:text-fht-white p-2.5 rounded-lg border border-federation/30 hover:border-federation/60 transition-colors duration-150"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="border-b border-federation/20 px-6 lg:px-8 flex items-center gap-6 overflow-x-auto">
        {abas.map((a) => (
          <button
            key={a.valor}
            onClick={() => setAba(a.valor)}
            className={`font-display text-sm tracking-wider py-4 px-1 flex items-center gap-2 whitespace-nowrap transition-colors duration-150 ${
              aba === a.valor ? 'text-gold border-b-2 border-gold' : 'text-gray-soft hover:text-fht-white'
            }`}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      {/* Corpo scrollável */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        {aba === 'chaveamento' &&
          (dados ? (
            <ChaveamentoTab bracket={dados.bracket} />
          ) : (
            <EmptyTab
              icon={<Trophy size={32} className="text-gray-soft/50" />}
              texto="O chaveamento e o sorteio das chaves chegam na próxima etapa do módulo de Competições."
            />
          ))}
        {aba === 'equipes' && <EquipesTab elencos={elencos} />}
        {aba === 'checkin' && (
          <CheckinTab
            atletas={dados ? dados.checkin : []}
            local={localDe(comp)}
            dia={dados ? dados.dataDia : ''}
          />
        )}
        {aba === 'jogos' && <JogosTab jogosIniciais={dados ? dados.jogos : []} />}
      </div>

      {/* Confirmação — encerrar campeonato */}
      {confirmarEncerrar && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
          onClick={() => setConfirmarEncerrar(false)}
        >
          <div
            className="bg-[#0a1628] border border-federation/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                <TriangleAlert size={20} className="text-orange-400" />
              </span>
              <h3 className="font-display text-fht-white text-xl tracking-wide leading-tight">
                ENCERRAR O CAMPEONATO?
              </h3>
            </div>
            <p className="font-body text-gray-soft text-sm">
              Esta ação finaliza a competição. O campeonato passa a “Encerrado” e os resultados ficam registrados.
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setConfirmarEncerrar(false)} className={btnSecundario}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  setConfirmarEncerrar(false);
                  void aplicarStatus('ENCERRADO');
                }}
                className={btnPrimario}
              >
                <CircleCheck size={16} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Modal de criação / edição — salva na API
// ————————————————————————————————————————————————————————————
function CriarModal({ editando, onClose, onSalvo }: {
  editando: Competicao | null;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState<string>(editando?.nome ?? '');
  const [categorias, setCategorias] = useState<CompeticaoCategoria[]>(editando?.categorias ?? []);
  const [inicio, setInicio] = useState<string>(editando?.dataInicio ?? '');
  const [fim, setFim] = useState<string>(editando?.dataFim ?? '');
  const [local, setLocal] = useState<string>(editando?.local ?? '');
  const [cidade, setCidade] = useState<string>(editando?.cidade ?? '');
  const [numeroEquipes, setNumeroEquipes] = useState<string>(String(editando?.numeroEquipes ?? 0));
  const [descricao, setDescricao] = useState<string>(editando?.descricao ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const toggleCategoria = (cat: CompeticaoCategoria) => {
    setCategorias((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const podeSalvar = nome.trim() !== '' && inicio !== '' && fim !== '' && !salvando;

  async function salvar() {
    setSalvando(true);
    setErro('');
    const corpo = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      categorias,
      dataInicio: inicio,
      dataFim: fim,
      local: local.trim(),
      cidade: cidade.trim(),
      numeroEquipes: Number(numeroEquipes) || 0,
    };
    try {
      if (editando) {
        await apiPut(`/api/competicoes/${editando.id}`, corpo);
      } else {
        await apiPostJson('/api/competicoes', corpo);
      }
      onSalvo();
      onClose();
    } catch (e) {
      setErro(msgErro(e));
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-federation/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-gold" />
            <h3 className="font-display text-fht-white text-xl tracking-wide">
              {editando ? 'EDITAR COMPETIÇÃO' : 'NOVA COMPETIÇÃO'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-soft hover:text-fht-white p-1.5 rounded-lg hover:bg-federation/10 transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 flex flex-col gap-4">
          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Nome da competição
            </span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Campeonato Tocantinense Adulto"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
          </label>

          <div>
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Categorias</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_DISPONIVEIS.map((cat) => {
                const ativo = categorias.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategoria(cat)}
                    className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors duration-150 ${
                      ativo
                        ? 'text-blue-300 bg-blue-mid/10 border-blue-400/30'
                        : 'text-gray-soft bg-gray-soft/5 border-gray-soft/20 hover:border-gray-soft/40'
                    }`}
                  >
                    {rotuloCategoria(cat)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Data início</span>
              <input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
              />
            </label>
            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Data fim</span>
              <input
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block col-span-2">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Local / ginásio</span>
              <input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ex.: Ginásio Ayrton Senna"
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
              />
            </label>
            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Cidade</span>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Palmas"
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Número de equipes
            </span>
            <input
              type="number"
              min={0}
              value={numeroEquipes}
              onChange={(e) => setNumeroEquipes(e.target.value)}
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
            <span className="font-body text-gray-soft/70 text-[11px] mt-1 block">
              Informado à mão por enquanto — passa a ser contado pelas inscrições na próxima etapa.
            </span>
          </label>

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Descrição <span className="normal-case tracking-normal">(opcional)</span>
            </span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Informações gerais sobre a competição"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full resize-y"
            />
          </label>

          {/* O status não é escolhido aqui: sai das datas. Ver docs/MODULO-COMPETICOES.md §7. */}
          <div className="bg-federation/10 border border-federation/30 rounded-lg px-4 py-3">
            <p className="font-body text-gray-soft text-xs leading-relaxed">
              O status é calculado automaticamente pelas datas (em breve → em andamento → encerrado).
              Para abrir inscrições, adiar ou encerrar antes do prazo, use os botões no painel de gerenciamento.
            </p>
          </div>

          {erro && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <TriangleAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="font-body text-red-400 text-sm">{erro}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-federation/20 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={salvando}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={!podeSalvar}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} />
            {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Página
// ————————————————————————————————————————————————————————————
export function CompeticoesPage() {
  const [filtro, setFiltro] = useState<FiltroStatus>('todos');
  const [criarAberto, setCriarAberto] = useState<boolean>(false);
  const [editando, setEditando] = useState<Competicao | null>(null);
  const [gerenciando, setGerenciando] = useState<Competicao | null>(null);
  const [deletando, setDeletando] = useState<Competicao | null>(null);
  const [deletandoAgora, setDeletandoAgora] = useState(false);
  const [competicoes, setCompeticoes] = useState<Competicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      setCompeticoes(await apiGet<CompeticaoDTO[]>('/api/competicoes'));
      setErro('');
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const listaFiltrada = filtro === 'todos' ? competicoes : competicoes.filter((c) => c.status === filtro);

  const contar = (valor: FiltroStatus): number =>
    valor === 'todos' ? competicoes.length : competicoes.filter((c) => c.status === valor).length;

  const abrirCriacao = () => {
    setEditando(null);
    setCriarAberto(true);
  };

  const handleEditar = (c: Competicao) => {
    setEditando(c);
    setCriarAberto(true);
  };

  async function confirmarDelecao() {
    if (!deletando || deletandoAgora) return;
    setDeletandoAgora(true);
    try {
      await apiDelete(`/api/competicoes/${deletando.id}`);
      setDeletando(null);
      await carregar();
    } catch (e) {
      setErro(msgErro(e));
      setDeletando(null);
    } finally {
      setDeletandoAgora(false);
    }
  }

  return (
    <>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-display text-fht-white text-3xl">COMPETIÇÕES</h2>
          <p className="font-body text-gray-soft text-sm mt-1">
            Cadastre campeonatos e controle o que aparece no site. Inscrições, chaveamento,
            escalações, check-in e placares chegam nas próximas etapas do módulo.
          </p>
        </div>
        <button
          onClick={abrirCriacao}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
        >
          <Plus size={16} />
          Nova competição
        </button>
      </div>

      {erro && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
          <TriangleAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="font-body text-red-400 text-sm">{erro}</p>
        </div>
      )}

      {/* Filtros por status */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {FILTROS.map((f) => {
          const ativo = filtro === f.valor;
          return (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`font-body text-xs px-3.5 py-1.5 rounded-full border transition-colors duration-150 flex items-center gap-1.5 ${
                ativo
                  ? 'text-gold bg-gold/10 border-gold/40'
                  : 'text-gray-soft bg-gray-soft/5 border-gray-soft/20 hover:border-gray-soft/40'
              }`}
            >
              {f.label}
              <span
                className={`font-body text-[10px] rounded-full px-1.5 py-0.5 ${
                  ativo ? 'bg-gold/20 text-gold' : 'bg-federation/20 text-gray-soft'
                }`}
              >
                {contar(f.valor)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de competições */}
      {carregando ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[0, 1].map((i) => (
            <div key={i} className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 flex flex-col items-center gap-3">
          <Trophy size={32} className="text-gray-soft/50" />
          <p className="font-body text-gray-soft text-sm">
            {competicoes.length === 0
              ? 'Nenhuma competição cadastrada. Crie a primeira em "Nova competição".'
              : 'Nenhuma competição com este status.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {listaFiltrada.map((comp) => (
            <CompeticaoCard
              key={comp.id}
              comp={comp}
              onGerenciar={setGerenciando}
              onEditar={handleEditar}
              onDeletar={setDeletando}
            />
          ))}
        </div>
      )}

      {/* Modais / painéis */}
      {criarAberto && (
        <CriarModal
          editando={editando}
          onClose={() => { setCriarAberto(false); setEditando(null); }}
          onSalvo={carregar}
        />
      )}
      {gerenciando && (
        <PainelFullscreen
          comp={gerenciando}
          onClose={() => setGerenciando(null)}
          onAtualizado={(c) => { setGerenciando(c); void carregar(); }}
          onEditar={() => {
            setEditando(gerenciando);
            setGerenciando(null);
            setCriarAberto(true);
          }}
        />
      )}

      {/* Confirmação de exclusão */}
      {deletando && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
          onClick={() => setDeletando(null)}
        >
          <div
            className="bg-[#0a1628] border border-federation/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <TriangleAlert size={20} className="text-red-400" />
              </span>
              <h3 className="font-display text-fht-white text-xl tracking-wide leading-tight">
                DELETAR COMPETIÇÃO?
              </h3>
            </div>
            <p className="font-body text-gray-soft text-sm">
              <span className="text-fht-white">{deletando.nome}</span> será removida permanentemente,
              junto com tudo que estiver ligado a ela. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setDeletando(null)}
                disabled={deletandoAgora}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDelecao}
                disabled={deletandoAgora}
                className="font-display text-fht-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                {deletandoAgora ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
