import { useState } from 'react';
import {
  Trophy,
  Plus,
  X,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Award,
  Clock,
  ChevronRight,
  Check,
} from 'lucide-react';

// ————————————————————————————————————————————————————————————
// Tipos
// ————————————————————————————————————————————————————————————
type CompStatus = 'em-andamento' | 'inscricoes-abertas' | 'em-breve' | 'encerrado';
type FiltroStatus = CompStatus | 'todos';
type PainelAba = 'equipes' | 'jogos' | 'classificacao';

interface Equipe {
  sigla: string;
  nome: string;
  cidade: string;
}

interface Jogo {
  id: number;
  mandante: string;
  visitante: string;
  placarM: number | null;
  placarV: number | null;
  quando: string;
  status: 'Encerrado' | 'Agendado';
}

interface ClassificacaoRow {
  pos: number;
  clube: string;
  p: number;
  j: number;
  v: number;
  e: number;
  d: number;
  saldo: number;
}

interface Competicao {
  id: number;
  nome: string;
  status: CompStatus;
  categorias: string[];
  periodo: string;
  local: string;
  numEquipes: number;
  equipes: Equipe[];
  jogos: Jogo[];
  classificacao: ClassificacaoRow[];
}

// ————————————————————————————————————————————————————————————
// Metadados de status
// ————————————————————————————————————————————————————————————
const STATUS_META: Record<CompStatus, { label: string; badge: string }> = {
  'em-andamento': { label: 'Em andamento', badge: 'text-green-400 bg-green-500/10 border-green-500/30' },
  'inscricoes-abertas': { label: 'Inscrições abertas', badge: 'text-gold bg-gold/10 border-gold/30' },
  'em-breve': { label: 'Em breve', badge: 'text-blue-300 bg-blue-mid/10 border-blue-400/30' },
  encerrado: { label: 'Encerrado', badge: 'text-gray-soft bg-gray-soft/10 border-gray-soft/30' },
};

const FILTROS: { valor: FiltroStatus; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'em-andamento', label: 'Em andamento' },
  { valor: 'inscricoes-abertas', label: 'Inscrições abertas' },
  { valor: 'em-breve', label: 'Em breve' },
  { valor: 'encerrado', label: 'Encerrado' },
];

// ————————————————————————————————————————————————————————————
// Mock
// ————————————————————————————————————————————————————————————
const EQUIPES_ESTADUAL: Equipe[] = [
  { sigla: 'PLM', nome: 'Palmas HC', cidade: 'Palmas' },
  { sigla: 'ARA', nome: 'Araguaína HC', cidade: 'Araguaína' },
  { sigla: 'GUR', nome: 'Gurupi EC', cidade: 'Gurupi' },
  { sigla: 'PNH', nome: 'Porto Nacional HC', cidade: 'Porto Nacional' },
  { sigla: 'TCP', nome: 'Tocantinópolis Hand', cidade: 'Tocantinópolis' },
  { sigla: 'COL', nome: 'Colinas HC', cidade: 'Colinas do Tocantins' },
];

const JOGOS_ESTADUAL: Jogo[] = [
  { id: 1, mandante: 'PLM', visitante: 'GUR', placarM: 28, placarV: 24, quando: '10 de abr. — 19h00', status: 'Encerrado' },
  { id: 2, mandante: 'ARA', visitante: 'COL', placarM: 31, placarV: 22, quando: '10 de abr. — 20h30', status: 'Encerrado' },
  { id: 3, mandante: 'PNH', visitante: 'TCP', placarM: 26, placarV: 26, quando: '17 de abr. — 19h00', status: 'Encerrado' },
  { id: 4, mandante: 'PLM', visitante: 'ARA', placarM: 25, placarV: 23, quando: '24 de abr. — 19h30', status: 'Encerrado' },
  { id: 5, mandante: 'GUR', visitante: 'PNH', placarM: 20, placarV: 27, quando: '24 de abr. — 21h00', status: 'Encerrado' },
  { id: 6, mandante: 'COL', visitante: 'PLM', placarM: null, placarV: null, quando: '15 de mai. — 19h00', status: 'Agendado' },
];

const CLASSIFICACAO_ESTADUAL: ClassificacaoRow[] = [
  { pos: 1, clube: 'Palmas HC', p: 6, j: 2, v: 2, e: 0, d: 0, saldo: 6 },
  { pos: 2, clube: 'Araguaína HC', p: 3, j: 2, v: 1, e: 0, d: 1, saldo: 1 },
  { pos: 3, clube: 'Porto Nacional HC', p: 4, j: 2, v: 1, e: 1, d: 0, saldo: 7 },
  { pos: 4, clube: 'Tocantinópolis Hand', p: 1, j: 1, v: 0, e: 1, d: 0, saldo: 0 },
  { pos: 5, clube: 'Gurupi EC', p: 0, j: 2, v: 0, e: 0, d: 2, saldo: -11 },
  { pos: 6, clube: 'Colinas HC', p: 0, j: 2, v: 0, e: 0, d: 2, saldo: -10 },
];

const COMPETICOES: Competicao[] = [
  {
    id: 1,
    nome: 'Campeonato Tocantinense Adulto Masculino',
    status: 'em-andamento',
    categorias: ['Adulto'],
    periodo: '10 de abr. — 28 de jun. de 2025',
    local: 'Ginásio Ayrton Senna — Palmas/TO',
    numEquipes: 6,
    equipes: EQUIPES_ESTADUAL,
    jogos: JOGOS_ESTADUAL,
    classificacao: CLASSIFICACAO_ESTADUAL,
  },
  {
    id: 2,
    nome: 'Copa TO de Handebol de Base',
    status: 'inscricoes-abertas',
    categorias: ['Sub-12', 'Sub-14', 'Sub-16'],
    periodo: '05 de ago. — 20 de set. de 2025',
    local: 'Ginásio Municipal — Araguaína/TO',
    numEquipes: 4,
    equipes: [
      { sigla: 'ARA', nome: 'Araguaína HC', cidade: 'Araguaína' },
      { sigla: 'PLM', nome: 'Palmas HC', cidade: 'Palmas' },
      { sigla: 'PNH', nome: 'Porto Nacional HC', cidade: 'Porto Nacional' },
      { sigla: 'GUR', nome: 'Gurupi EC', cidade: 'Gurupi' },
    ],
    jogos: [],
    classificacao: [],
  },
  {
    id: 3,
    nome: 'Taça Tocantins Feminino Sub-18',
    status: 'em-breve',
    categorias: ['Sub-18'],
    periodo: '01 de out. — 30 de nov. de 2025',
    local: 'Ginásio Poliesportivo — Gurupi/TO',
    numEquipes: 0,
    equipes: [],
    jogos: [],
    classificacao: [],
  },
  {
    id: 4,
    nome: 'Liga Tocantinense 2024 — Adulto Feminino',
    status: 'encerrado',
    categorias: ['Adulto'],
    periodo: '12 de mar. — 15 de jun. de 2024',
    local: 'Ginásio Ayrton Senna — Palmas/TO',
    numEquipes: 5,
    equipes: [
      { sigla: 'PLM', nome: 'Palmas HC', cidade: 'Palmas' },
      { sigla: 'ARA', nome: 'Araguaína HC', cidade: 'Araguaína' },
      { sigla: 'PNH', nome: 'Porto Nacional HC', cidade: 'Porto Nacional' },
      { sigla: 'TCP', nome: 'Tocantinópolis Hand', cidade: 'Tocantinópolis' },
      { sigla: 'COL', nome: 'Colinas HC', cidade: 'Colinas do Tocantins' },
    ],
    jogos: [
      { id: 1, mandante: 'PLM', visitante: 'ARA', placarM: 30, placarV: 27, quando: 'Final — 15 de jun. de 2024', status: 'Encerrado' },
    ],
    classificacao: [
      { pos: 1, clube: 'Palmas HC', p: 12, j: 4, v: 4, e: 0, d: 0, saldo: 22 },
      { pos: 2, clube: 'Araguaína HC', p: 9, j: 4, v: 3, e: 0, d: 1, saldo: 12 },
      { pos: 3, clube: 'Porto Nacional HC', p: 6, j: 4, v: 2, e: 0, d: 2, saldo: -3 },
      { pos: 4, clube: 'Tocantinópolis Hand', p: 3, j: 4, v: 1, e: 0, d: 3, saldo: -9 },
      { pos: 5, clube: 'Colinas HC', p: 0, j: 4, v: 0, e: 0, d: 4, saldo: -22 },
    ],
  },
];

const SELO_DEMO = (
  <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
    demonstração
  </span>
);

// ————————————————————————————————————————————————————————————
// Sub-componentes
// ————————————————————————————————————————————————————————————
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
          {comp.categorias.map((cat) => (
            <CategoriaTag key={cat} label={cat} />
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
          {comp.periodo}
        </p>
        <p className="font-body text-gray-soft text-sm flex items-center gap-2">
          <MapPin size={15} className="text-gold shrink-0" />
          {comp.local}
        </p>
        <p className="font-body text-gray-soft text-sm flex items-center gap-2">
          <Users size={15} className="text-gold shrink-0" />
          {comp.numEquipes} {comp.numEquipes === 1 ? 'equipe inscrita' : 'equipes inscritas'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        {SELO_DEMO}
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
// Painel de gestão (slide-over)
// ————————————————————————————————————————————————————————————
function GestaoPanel({ comp, onClose }: { comp: Competicao; onClose: () => void }) {
  const [aba, setAba] = useState<PainelAba>('equipes');
  const [placarCasa, setPlacarCasa] = useState<string>('');
  const [placarFora, setPlacarFora] = useState<string>('');

  const proximoJogo = comp.jogos.find((j) => j.status === 'Agendado') ?? null;

  const siglaNome = (sigla: string): string =>
    comp.equipes.find((e) => e.sigla === sigla)?.sigla ?? sigla;

  const abas: { valor: PainelAba; label: string }[] = [
    { valor: 'equipes', label: 'EQUIPES' },
    { valor: 'jogos', label: 'JOGOS' },
    { valor: 'classificacao', label: 'CLASSIFICAÇÃO' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div
        className="w-full max-w-2xl h-full bg-[#0a1628] border-l border-federation/20 overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-federation/20 sticky top-0 bg-[#0a1628] z-10">
          <div className="flex flex-col gap-2 pr-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-gold" />
              <StatusBadge status={comp.status} />
            </div>
            <h3 className="font-display text-fht-white text-2xl tracking-wide leading-tight">{comp.nome}</h3>
            <p className="font-body text-gray-soft text-xs flex items-center gap-2">
              <MapPin size={13} className="text-gold" />
              {comp.local}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar painel"
            className="text-gray-soft hover:text-fht-white p-2 rounded-lg hover:bg-federation/10 transition-colors duration-150 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-federation/20">
          {abas.map((a) => (
            <button
              key={a.valor}
              onClick={() => setAba(a.valor)}
              className={`font-display text-sm tracking-wider pb-2 px-1 transition-colors duration-150 ${
                aba === a.valor ? 'text-gold border-b-2 border-gold' : 'text-gray-soft hover:text-fht-white'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          {aba === 'equipes' && (
            <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-gold text-xs tracking-widest">
                  CLUBES INSCRITOS ({comp.equipes.length})
                </p>
                {SELO_DEMO}
              </div>
              {comp.equipes.length === 0 ? (
                <p className="font-body text-gray-soft text-sm py-4 text-center">
                  Nenhum clube inscrito ainda.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {comp.equipes.map((e) => (
                    <div
                      key={e.sigla}
                      className="flex items-center gap-3 border border-federation/10 rounded-lg px-3 py-2.5 hover:bg-federation/5 transition-colors duration-150"
                    >
                      <span className="font-display text-gold bg-gold/10 border border-gold/30 rounded-md w-11 h-9 flex items-center justify-center text-sm tracking-wider shrink-0">
                        {e.sigla}
                      </span>
                      <div className="min-w-0">
                        <p className="font-body text-fht-white text-sm truncate">{e.nome}</p>
                        <p className="font-body text-gray-soft text-xs flex items-center gap-1">
                          <MapPin size={11} />
                          {e.cidade}/TO
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center justify-center gap-2">
                <Plus size={16} />
                Inscrever clube
              </button>
            </div>
          )}

          {aba === 'jogos' && (
            <>
              {/* Painel ao vivo */}
              <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-gold text-xs tracking-widest flex items-center gap-2">
                    <Clock size={14} />
                    PAINEL AO VIVO
                  </p>
                  {SELO_DEMO}
                </div>
                {proximoJogo ? (
                  <>
                    <p className="font-body text-gray-soft text-xs">
                      Lançar placar do próximo jogo · {proximoJogo.quando}
                    </p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                          {siglaNome(proximoJogo.mandante)} (casa)
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={placarCasa}
                          onChange={(e) => setPlacarCasa(e.target.value)}
                          placeholder="0"
                          className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full text-center"
                        />
                      </div>
                      <span className="font-display text-gray-soft text-xl pb-3">×</span>
                      <div className="flex-1">
                        <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                          {siglaNome(proximoJogo.visitante)} (fora)
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={placarFora}
                          onChange={(e) => setPlacarFora(e.target.value)}
                          placeholder="0"
                          className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full text-center"
                        />
                      </div>
                    </div>
                    <button className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center justify-center gap-2">
                      <Check size={16} />
                      Salvar placar
                    </button>
                  </>
                ) : (
                  <p className="font-body text-gray-soft text-sm py-2">
                    Nenhum jogo agendado no momento.
                  </p>
                )}
              </div>

              {/* Tabela de confrontos */}
              <div className="flex flex-col gap-3">
                <p className="font-display text-gold text-xs tracking-widest">CONFRONTOS</p>
                {comp.jogos.length === 0 ? (
                  <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                    <p className="font-body text-gray-soft text-sm text-center py-2">
                      Tabela de jogos ainda não gerada.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[480px]">
                      <thead>
                        <tr className="border-b border-federation/20">
                          <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                            Confronto
                          </th>
                          <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-center">
                            Placar
                          </th>
                          <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                            Data / hora
                          </th>
                          <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {comp.jogos.map((j) => (
                          <tr
                            key={j.id}
                            className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 font-body text-fht-white text-sm whitespace-nowrap">
                              {j.mandante} <span className="text-gray-soft">x</span> {j.visitante}
                            </td>
                            <td className="px-4 py-3 font-display text-fht-white text-base text-center tracking-wider whitespace-nowrap">
                              {j.placarM !== null && j.placarV !== null ? (
                                <span>
                                  {j.placarM} <span className="text-gray-soft text-sm">x</span> {j.placarV}
                                </span>
                              ) : (
                                <span className="text-gray-soft">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-body text-gray-soft text-sm whitespace-nowrap">
                              {j.quando}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-body text-xs px-2.5 py-1 rounded-full border ${
                                  j.status === 'Encerrado'
                                    ? 'text-gray-soft bg-gray-soft/10 border-gray-soft/30'
                                    : 'text-blue-300 bg-blue-mid/10 border-blue-400/30'
                                }`}
                              >
                                {j.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {aba === 'classificacao' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-display text-gold text-xs tracking-widest flex items-center gap-2">
                  <Award size={14} />
                  CLASSIFICAÇÃO
                </p>
                {SELO_DEMO}
              </div>
              {comp.classificacao.length === 0 ? (
                <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                  <p className="font-body text-gray-soft text-sm text-center py-2">
                    Classificação disponível após o início dos jogos.
                  </p>
                </div>
              ) : (
                <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="border-b border-federation/20">
                        <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                          Pos
                        </th>
                        <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                          Clube
                        </th>
                        <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-3 py-3 text-center">
                          P
                        </th>
                        <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-3 py-3 text-center">
                          J
                        </th>
                        <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-3 py-3 text-center">
                          V
                        </th>
                        <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-3 py-3 text-center">
                          E
                        </th>
                        <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-3 py-3 text-center">
                          D
                        </th>
                        <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-3 py-3 text-center">
                          Saldo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comp.classificacao.map((row) => (
                        <tr
                          key={row.pos}
                          className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150"
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`font-display text-sm tracking-wider inline-flex items-center justify-center w-6 h-6 rounded-md ${
                                row.pos === 1
                                  ? 'text-night bg-gold'
                                  : 'text-fht-white bg-federation/20'
                              }`}
                            >
                              {row.pos}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-body text-fht-white text-sm whitespace-nowrap">
                            {row.clube}
                          </td>
                          <td className="px-3 py-3 font-display text-gold text-sm text-center tracking-wider">
                            {row.p}
                          </td>
                          <td className="px-3 py-3 font-body text-gray-soft text-sm text-center">{row.j}</td>
                          <td className="px-3 py-3 font-body text-gray-soft text-sm text-center">{row.v}</td>
                          <td className="px-3 py-3 font-body text-gray-soft text-sm text-center">{row.e}</td>
                          <td className="px-3 py-3 font-body text-gray-soft text-sm text-center">{row.d}</td>
                          <td
                            className={`px-3 py-3 font-body text-sm text-center ${
                              row.saldo > 0
                                ? 'text-green-400'
                                : row.saldo < 0
                                ? 'text-red-400'
                                : 'text-gray-soft'
                            }`}
                          >
                            {row.saldo > 0 ? `+${row.saldo}` : row.saldo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="sticky bottom-0 bg-[#0a1628] border-t border-federation/20 p-5 flex flex-wrap gap-3">
          <button className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2">
            <Pencil size={16} />
            Editar competição
          </button>
          <button
            onClick={onClose}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Modal de criação
// ————————————————————————————————————————————————————————————
const CATEGORIAS_DISPONIVEIS = ['Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Adulto'];

function CriarModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState<string>('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [inicio, setInicio] = useState<string>('');
  const [fim, setFim] = useState<string>('');
  const [local, setLocal] = useState<string>('');
  const [status, setStatus] = useState<CompStatus>('em-breve');

  const toggleCategoria = (cat: string) => {
    setCategorias((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            <h3 className="font-display text-fht-white text-xl tracking-wide">NOVA COMPETIÇÃO</h3>
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
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Categorias
            </span>
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
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                Data início
              </span>
              <input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
              />
            </label>
            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                Data fim
              </span>
              <input
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Local / ginásio
            </span>
            <input
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex.: Ginásio Ayrton Senna — Palmas/TO"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
          </label>

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CompStatus)}
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
            >
              <option value="em-breve">Em breve</option>
              <option value="inscricoes-abertas">Inscrições abertas</option>
              <option value="em-andamento">Em andamento</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </label>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-federation/20 flex items-center justify-between gap-3">
          {SELO_DEMO}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
            >
              <Check size={16} />
              Criar
            </button>
          </div>
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
  const [gerenciando, setGerenciando] = useState<Competicao | null>(null);

  const listaFiltrada =
    filtro === 'todos' ? COMPETICOES : COMPETICOES.filter((c) => c.status === filtro);

  const contar = (valor: FiltroStatus): number =>
    valor === 'todos' ? COMPETICOES.length : COMPETICOES.filter((c) => c.status === valor).length;

  const handleEditar = (_c: Competicao) => {
    setCriarAberto(true);
  };

  const handleDeletar = (_c: Competicao) => {
    // mock — ação de demonstração
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-display text-fht-white text-3xl">COMPETIÇÕES</h2>
          <p className="font-body text-gray-soft text-sm mt-1">
            Gerencie campeonatos, equipes, jogos e classificação da federação.
          </p>
        </div>
        <button
          onClick={() => setCriarAberto(true)}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
        >
          <Plus size={16} />
          Nova competição
        </button>
      </div>

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
      {listaFiltrada.length === 0 ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 flex flex-col items-center gap-3">
          <Trophy size={32} className="text-gray-soft/50" />
          <p className="font-body text-gray-soft text-sm">Nenhuma competição com este status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {listaFiltrada.map((comp) => (
            <CompeticaoCard
              key={comp.id}
              comp={comp}
              onGerenciar={setGerenciando}
              onEditar={handleEditar}
              onDeletar={handleDeletar}
            />
          ))}
        </div>
      )}

      {/* Modais / painéis */}
      {criarAberto && <CriarModal onClose={() => setCriarAberto(false)} />}
      {gerenciando && <GestaoPanel comp={gerenciando} onClose={() => setGerenciando(null)} />}
    </div>
  );
}
