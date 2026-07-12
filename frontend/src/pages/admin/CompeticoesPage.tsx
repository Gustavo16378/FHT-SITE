import { useState, type ReactNode } from 'react';
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
} from 'lucide-react';

// ————————————————————————————————————————————————————————————
// Tipos
// ————————————————————————————————————————————————————————————
type CompStatus = 'em-andamento' | 'inscricoes-abertas' | 'em-breve' | 'encerrado';
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

interface Competicao {
  id: number;
  nome: string;
  status: CompStatus;
  categorias: string[];
  periodo: string;
  local: string;
  numEquipes: number;
  equipes: Equipe[];
  dados?: DadosOperacionais;
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
// Mock — geração determinística de elencos (sem random)
// ————————————————————————————————————————————————————————————
const NOMES: string[] = [
  'Lucas Andrade', 'Gabriel Nunes', 'Matheus Rocha', 'Pedro Henrique Lima', 'João Vitor Souza',
  'Rafael Carvalho', 'Bruno Teixeira', 'Guilherme Alves', 'Felipe Moraes', 'Thiago Barbosa',
  'Vinícius Cardoso', 'Diego Fernandes', 'Leonardo Pires', 'André Ribeiro', 'Caio Martins',
  'Igor Nascimento', 'Rodrigo Campos', 'Marcelo Duarte', 'Henrique Gomes', 'Daniel Farias',
  'Otávio Mendes', 'Eduardo Ramos', 'Fábio Correia', 'Renan Azevedo', 'Wesley Oliveira',
  'Murilo Batista', 'Gustavo Freitas', 'Alexandre Pinto', 'Ricardo Lopes', 'Anderson Silva',
  'Yuri Cavalcante', 'Emerson Dias', 'Luiz Fernando Melo', 'Samuel Araújo', 'Kaique Santana',
  'Vitor Hugo Costa', 'Danilo Macedo', 'Fernando Tavares', 'Robson Vieira', 'Everton Nogueira',
  'Jonas Siqueira', 'Cléber Antunes', 'Maicon Reis', 'Elias Furtado', 'Breno Castro',
  'Douglas Prado', 'Nathan Queiroz', 'Sérgio Bezerra', 'Wallace Monteiro', 'Tiago Peixoto',
];

const CICLO_POS: Posicao[] = [
  'Goleiro', 'Armador', 'Central', 'Ponta', 'Pivô', 'Ponta', 'Armador', 'Goleiro', 'Central', 'Ponta',
];

function montarElenco(sigla: string, offset: number, qtd: number): Elenco {
  const clube = CLUBES[sigla];
  const atletas: Atleta[] = Array.from({ length: qtd }, (_, i) => ({
    id: offset * 100 + i,
    nome: NOMES[(offset + i) % NOMES.length],
    posicao: CICLO_POS[i % CICLO_POS.length],
    categoria: 'Adulto',
  }));
  return { sigla, nome: clube.nome, cidade: clube.cidade, atletas };
}

// 8 elencos completos, sem repetição de nomes entre clubes
const ELENCOS: Elenco[] = [
  montarElenco('PLM', 0, 8),
  montarElenco('ARA', 8, 7),
  montarElenco('GUR', 15, 6),
  montarElenco('PNH', 21, 8),
  montarElenco('TCP', 29, 6),
  montarElenco('COL', 35, 5),
  montarElenco('MIR', 40, 5),
  montarElenco('PAR', 45, 5),
];

// Documentos fictícios determinísticos (sem random) para as credenciais
function pad(num: number, len: number): string {
  return String(Math.abs(num)).padStart(len, '0').slice(-len);
}

function credencialMock(seed: number): { cpf: string; rg: string; nascimento: string } {
  const cpf = `${pad(seed * 3 + 137, 3)}.${pad(seed * 7 + 241, 3)}.${pad(seed * 11 + 356, 3)}-${pad(
    seed * 13 + 10,
    2,
  )}`;
  const rgN = pad(seed * 17 + 10234567, 8);
  const rg = `${rgN.slice(0, 2)}.${rgN.slice(2, 5)}.${rgN.slice(5, 8)}-${pad(seed % 10, 1)}`;
  const nascimento = `${pad(((seed * 5) % 27) + 1, 2)}/${pad(((seed * 3) % 12) + 1, 2)}/${1990 + (seed % 15)}`;
  return { cpf, rg, nascimento };
}

// Check-in do DIA: todos os atletas escalados de todos os clubes participantes.
function montarCheckin(siglas: string[]): CheckinAtleta[] {
  const lista: CheckinAtleta[] = [];
  let n = 0;
  ELENCOS.filter((e) => siglas.includes(e.sigla)).forEach((e) => {
    e.atletas.forEach((a) => {
      n += 1;
      const cred = credencialMock(n);
      lista.push({
        id: a.id,
        nome: a.nome,
        sigla: e.sigla,
        posicao: a.posicao,
        categoria: a.categoria,
        cpf: cred.cpf,
        rg: cred.rg,
        nascimento: cred.nascimento,
        presente: n % 3 === 0,
      });
    });
  });
  return lista;
}

// Chaveamento (mata-mata de 8 clubes) — quartas e semis já decididos
const QUARTAS: Confronto[] = [
  { id: 'QF1', aSigla: 'PLM', bSigla: 'MIR', placarA: 32, placarB: 21 },
  { id: 'QF2', aSigla: 'GUR', bSigla: 'TCP', placarA: 30, placarB: 22 },
  { id: 'QF3', aSigla: 'ARA', bSigla: 'COL', placarA: 28, placarB: 25 },
  { id: 'QF4', aSigla: 'PNH', bSigla: 'PAR', placarA: 27, placarB: 24 },
];

const SEMIS: Confronto[] = [
  { id: 'SF1', aSigla: 'PLM', bSigla: 'GUR', placarA: 29, placarB: 26 },
  { id: 'SF2', aSigla: 'ARA', bSigla: 'PNH', placarA: 24, placarB: 27 },
];

const BRACKET_EM_ANDAMENTO: Bracket = {
  quartas: QUARTAS,
  semis: SEMIS,
  final: { id: 'FIN', aSigla: 'PLM', bSigla: 'PNH', placarA: null, placarB: null },
  campeao: null,
};

const BRACKET_ENCERRADO: Bracket = {
  quartas: QUARTAS,
  semis: SEMIS,
  final: { id: 'FIN', aSigla: 'PLM', bSigla: 'PNH', placarA: 31, placarB: 28 },
  campeao: 'PLM',
};

const JOGOS_ESTADUAL: Jogo[] = [
  {
    id: 1, fase: 'Semifinal', mandante: 'PLM', visitante: 'GUR', placarM: 29, placarV: 26,
    horario: 'Ontem · 19h00', status: 'Encerrado',
    golsMandante: [
      { nome: 'Lucas Andrade', gols: 9 },
      { nome: 'Gabriel Nunes', gols: 7 },
      { nome: 'Matheus Rocha', gols: 6 },
      { nome: 'Pedro Henrique Lima', gols: 4 },
      { nome: 'Rafael Carvalho', gols: 3 },
    ],
    golsVisitante: [
      { nome: 'Igor Nascimento', gols: 8 },
      { nome: 'Rodrigo Campos', gols: 7 },
      { nome: 'Marcelo Duarte', gols: 6 },
      { nome: 'Henrique Gomes', gols: 5 },
    ],
  },
  {
    id: 2, fase: 'Semifinal', mandante: 'ARA', visitante: 'PNH', placarM: 24, placarV: 27,
    horario: 'Ontem · 21h00', status: 'Encerrado',
    golsMandante: [
      { nome: 'Felipe Moraes', gols: 8 },
      { nome: 'Thiago Barbosa', gols: 7 },
      { nome: 'Vinícius Cardoso', gols: 5 },
      { nome: 'Diego Fernandes', gols: 4 },
    ],
    golsVisitante: [
      { nome: 'Renan Azevedo', gols: 8 },
      { nome: 'Eduardo Ramos', gols: 7 },
      { nome: 'Fábio Correia', gols: 6 },
      { nome: 'Wesley Oliveira', gols: 6 },
    ],
  },
  {
    id: 3, fase: 'Disputa de 3º lugar', mandante: 'ARA', visitante: 'GUR', placarM: null, placarV: null,
    horario: 'Hoje · 17h00', status: 'Agendado',
    golsMandante: [], golsVisitante: [],
  },
  {
    id: 4, fase: 'Final', mandante: 'PLM', visitante: 'PNH', placarM: 18, placarV: 16,
    horario: 'Hoje · 19h30', status: 'Em andamento',
    golsMandante: [
      { nome: 'Lucas Andrade', gols: 6 },
      { nome: 'Gabriel Nunes', gols: 5 },
      { nome: 'Matheus Rocha', gols: 4 },
      { nome: 'Pedro Henrique Lima', gols: 3 },
    ],
    golsVisitante: [
      { nome: 'Renan Azevedo', gols: 5 },
      { nome: 'Eduardo Ramos', gols: 4 },
      { nome: 'Fábio Correia', gols: 4 },
      { nome: 'Wesley Oliveira', gols: 3 },
    ],
  },
];

const JOGOS_LIGA_2024: Jogo[] = [
  {
    id: 1, fase: 'Semifinal', mandante: 'PLM', visitante: 'GUR', placarM: 29, placarV: 26,
    horario: '08 de jun. de 2024', status: 'Encerrado',
    golsMandante: [
      { nome: 'Lucas Andrade', gols: 10 },
      { nome: 'Gabriel Nunes', gols: 7 },
      { nome: 'Matheus Rocha', gols: 6 },
      { nome: 'Pedro Henrique Lima', gols: 6 },
    ],
    golsVisitante: [
      { nome: 'Igor Nascimento', gols: 9 },
      { nome: 'Rodrigo Campos', gols: 7 },
      { nome: 'Marcelo Duarte', gols: 6 },
      { nome: 'Henrique Gomes', gols: 4 },
    ],
  },
  {
    id: 2, fase: 'Semifinal', mandante: 'ARA', visitante: 'PNH', placarM: 24, placarV: 27,
    horario: '08 de jun. de 2024', status: 'Encerrado',
    golsMandante: [
      { nome: 'Felipe Moraes', gols: 8 },
      { nome: 'Thiago Barbosa', gols: 7 },
      { nome: 'Vinícius Cardoso', gols: 5 },
      { nome: 'Diego Fernandes', gols: 4 },
    ],
    golsVisitante: [
      { nome: 'Renan Azevedo', gols: 9 },
      { nome: 'Eduardo Ramos', gols: 8 },
      { nome: 'Fábio Correia', gols: 6 },
      { nome: 'Wesley Oliveira', gols: 4 },
    ],
  },
  {
    id: 3, fase: 'Final', mandante: 'PLM', visitante: 'PNH', placarM: 31, placarV: 28,
    horario: '15 de jun. de 2024', status: 'Encerrado',
    golsMandante: [
      { nome: 'Lucas Andrade', gols: 11 },
      { nome: 'Gabriel Nunes', gols: 8 },
      { nome: 'Matheus Rocha', gols: 7 },
      { nome: 'Pedro Henrique Lima', gols: 5 },
    ],
    golsVisitante: [
      { nome: 'Renan Azevedo', gols: 9 },
      { nome: 'Eduardo Ramos', gols: 8 },
      { nome: 'Fábio Correia', gols: 6 },
      { nome: 'Wesley Oliveira', gols: 5 },
    ],
  },
];

const TODOS_CLUBES = Object.keys(CLUBES);

const DADOS_ESTADUAL: DadosOperacionais = {
  bracket: BRACKET_EM_ANDAMENTO,
  elencos: ELENCOS,
  checkin: montarCheckin(TODOS_CLUBES),
  jogos: JOGOS_ESTADUAL,
  dataDia: 'Sábado, 12 de julho de 2025',
};

const DADOS_LIGA_2024: DadosOperacionais = {
  bracket: BRACKET_ENCERRADO,
  elencos: ELENCOS,
  checkin: montarCheckin(TODOS_CLUBES).map((c) => ({ ...c, presente: true })),
  jogos: JOGOS_LIGA_2024,
  dataDia: 'Domingo, 15 de junho de 2024',
};

const COMPETICOES: Competicao[] = [
  {
    id: 1,
    nome: 'Campeonato Tocantinense Adulto Masculino',
    status: 'em-andamento',
    categorias: ['Adulto'],
    periodo: '10 de abr. — 28 de jun. de 2025',
    local: 'Ginásio Ayrton Senna — Palmas/TO',
    numEquipes: 8,
    equipes: Object.keys(CLUBES).map((s) => ({ sigla: s, nome: CLUBES[s].nome, cidade: CLUBES[s].cidade })),
    dados: DADOS_ESTADUAL,
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
  },
  {
    id: 4,
    nome: 'Liga Tocantinense 2024 — Adulto Masculino',
    status: 'encerrado',
    categorias: ['Adulto'],
    periodo: '12 de mar. — 15 de jun. de 2024',
    local: 'Ginásio Ayrton Senna — Palmas/TO',
    numEquipes: 8,
    equipes: Object.keys(CLUBES).map((s) => ({ sigla: s, nome: CLUBES[s].nome, cidade: CLUBES[s].cidade })),
    dados: DADOS_LIGA_2024,
  },
];

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
  const [aberto, setAberto] = useState<string | null>(null);

  if (elencos.length === 0) {
    return (
      <EmptyTab icon={<Users size={32} className="text-gray-soft/50" />} texto="Nenhum clube inscrito nesta competição ainda." />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SecaoTitulo icon={<Users size={14} />}>{`EQUIPES PARTICIPANTES (${elencos.length})`}</SecaoTitulo>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {elencos.map((e) => {
          const open = aberto === e.sigla;
          return (
            <div key={e.sigla} className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-hidden self-start">
              <button
                onClick={() => setAberto(open ? null : e.sigla)}
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
        texto="O check-in do dia fica disponível quando houver atletas escalados para a competição."
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
      <EmptyTab icon={<Play size={32} className="text-gray-soft/50" />} texto="A tabela de jogos aparece quando a competição começa." />
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
}: {
  comp: Competicao;
  onClose: () => void;
  onEditar: () => void;
}) {
  const [aba, setAba] = useState<PainelAba>('chaveamento');
  const dados = comp.dados ?? null;
  const elencos: Elenco[] = dados ? dados.elencos : comp.equipes.map((e) => ({ ...e, atletas: [] }));

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
            <StatusBadge status={comp.status} />
            {SELO_DEMO}
          </div>
          <h2 className="font-display text-fht-white text-2xl lg:text-3xl tracking-wide leading-none">{comp.nome}</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="font-body text-gray-soft text-xs flex items-center gap-1.5">
              <MapPin size={13} className="text-gold" />
              {comp.local}
            </p>
            <p className="font-body text-gray-soft text-xs flex items-center gap-1.5">
              <Calendar size={13} className="text-gold" />
              {comp.periodo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
              texto="O chaveamento é gerado quando as inscrições são encerradas e o sorteio das chaves acontece."
            />
          ))}
        {aba === 'equipes' && <EquipesTab elencos={elencos} />}
        {aba === 'checkin' && (
          <CheckinTab
            atletas={dados ? dados.checkin : []}
            local={comp.local}
            dia={dados ? dados.dataDia : ''}
          />
        )}
        {aba === 'jogos' && <JogosTab jogosIniciais={dados ? dados.jogos : []} />}
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Modal de criação (mantido)
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
                    {cat}
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

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Local / ginásio</span>
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

  const listaFiltrada = filtro === 'todos' ? COMPETICOES : COMPETICOES.filter((c) => c.status === filtro);

  const contar = (valor: FiltroStatus): number =>
    valor === 'todos' ? COMPETICOES.length : COMPETICOES.filter((c) => c.status === valor).length;

  const handleEditar = (_c: Competicao) => {
    setCriarAberto(true);
  };

  const handleDeletar = (_c: Competicao) => {
    // mock — ação de demonstração
  };

  return (
    <>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-display text-fht-white text-3xl">COMPETIÇÕES</h2>
          <p className="font-body text-gray-soft text-sm mt-1">
            Gerencie campeonatos, chaveamento, escalações, check-in e placares ao vivo.
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
      {gerenciando && (
        <PainelFullscreen
          comp={gerenciando}
          onClose={() => setGerenciando(null)}
          onEditar={() => {
            setGerenciando(null);
            setCriarAberto(true);
          }}
        />
      )}
    </>
  );
}
