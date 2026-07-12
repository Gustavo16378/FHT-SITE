import { useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import {
  UserCog,
  Star,
  Users,
  Shield,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Newspaper,
  DollarSign,
  Trophy,
  Image,
  ChevronRight,
  ChevronDown,
  Check,
} from 'lucide-react';

// ----------------------------------------------------------------------------
// Tipos & metadados
// ----------------------------------------------------------------------------
type IconType = ComponentType<{ className?: string }>;
type Nivel = 'DEV' | 'Master' | 'Comitê' | 'Clube';
type Scope =
  | 'arbitragem'
  | 'comunicacao'
  | 'financeiro'
  | 'competicoes'
  | 'conteudo';

interface AdminUser {
  id: number;
  nome: string;
  email: string;
  nivel: Nivel;
  cargo: string;
  scopes: Scope[];
  ativo: boolean;
}

interface ScopeMeta {
  key: Scope;
  label: string;
  icon: IconType;
  descricao: string;
}

const SCOPES: ScopeMeta[] = [
  { key: 'arbitragem', label: 'Arbitragem', icon: Shield, descricao: 'Gerencia árbitros e escalas de arbitragem.' },
  { key: 'comunicacao', label: 'Comunicação', icon: Newspaper, descricao: 'Publica notícias e comunicados oficiais.' },
  { key: 'financeiro', label: 'Financeiro', icon: DollarSign, descricao: 'Taxas, anuidades e balanços financeiros.' },
  { key: 'competicoes', label: 'Competições', icon: Trophy, descricao: 'Cria competições, jogos e resultados.' },
  { key: 'conteudo', label: 'Conteúdo', icon: Image, descricao: 'Galeria, diretoria e documentos do site.' },
];

const SCOPE_MAP: Record<Scope, ScopeMeta> = SCOPES.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {} as Record<Scope, ScopeMeta>);

const ALL_SCOPES: Scope[] = SCOPES.map((s) => s.key);

const NIVEL_BADGE: Record<Nivel, string> = {
  DEV: 'text-gold bg-gold/10 border-gold/30',
  Master: 'text-blue-300 bg-blue-mid/10 border-blue-400/30',
  Comitê: 'text-gray-soft bg-gray-soft/10 border-gray-soft/30',
  Clube: 'text-green-400 bg-green-500/10 border-green-500/30',
};

const NIVEL_LABEL: Record<Nivel, string> = {
  DEV: 'DEV / Dono',
  Master: 'Admin Master',
  Comitê: 'Comitê',
  Clube: 'ADMIN_CLUBE',
};

interface HierarquiaItem {
  nivel: Nivel;
  titulo: string;
  descricao: string;
  icon: IconType;
}

const HIERARQUIA: HierarquiaItem[] = [
  {
    nivel: 'DEV',
    titulo: 'DEV / Dono',
    descricao: 'Vê e altera tudo de todos — suporte total ao sistema.',
    icon: UserCog,
  },
  {
    nivel: 'Master',
    titulo: 'Admin Master / Presidente',
    descricao: 'Comanda os outros admins: cria, remove e define escopos.',
    icon: Star,
  },
  {
    nivel: 'Comitê',
    titulo: 'Comitê / Diretoria',
    descricao: 'Admins com permissões por área (scope por cargo).',
    icon: Users,
  },
  {
    nivel: 'Clube',
    titulo: 'ADMIN_CLUBE',
    descricao: 'Acesso só ao próprio clube — cadastra atletas, não aprova.',
    icon: Shield,
  },
];

const CLUBES_APROVADOS: string[] = [
  'Palmas HC',
  'Araguaína HC',
  'Gurupi EC',
  'Porto Nacional HC',
  'Tocantinópolis Hand',
  'Colinas HC',
];

const USUARIOS_MOCK: AdminUser[] = [
  {
    id: 1,
    nome: 'Gustavo Pereira',
    email: 'gustavo@fht.org.br',
    nivel: 'DEV',
    cargo: 'Dono & Desenvolvedor',
    scopes: [...ALL_SCOPES],
    ativo: true,
  },
  {
    id: 2,
    nome: 'João Carlos Mendonça',
    email: 'presidencia@fht.org.br',
    nivel: 'Master',
    cargo: 'Presidente da Federação',
    scopes: [...ALL_SCOPES],
    ativo: true,
  },
  {
    id: 3,
    nome: 'Ricardo Alves Nunes',
    email: 'arbitragem@fht.org.br',
    nivel: 'Comitê',
    cargo: 'Diretor de Arbitragem',
    scopes: ['arbitragem'],
    ativo: true,
  },
  {
    id: 4,
    nome: 'Fernanda Lima Costa',
    email: 'comunicacao@fht.org.br',
    nivel: 'Comitê',
    cargo: 'Diretora de Comunicação',
    scopes: ['comunicacao', 'conteudo'],
    ativo: true,
  },
  {
    id: 5,
    nome: 'Marcos Antônio Silva',
    email: 'financeiro@fht.org.br',
    nivel: 'Comitê',
    cargo: 'Diretor Financeiro',
    scopes: ['financeiro'],
    ativo: true,
  },
  {
    id: 6,
    nome: 'Patrícia Gomes Rocha',
    email: 'tecnico@fht.org.br',
    nivel: 'Comitê',
    cargo: 'Diretora Técnica',
    scopes: ['competicoes'],
    ativo: false,
  },
  {
    id: 7,
    nome: 'Palmas Handebol Clube',
    email: 'clube@palmashc.com.br',
    nivel: 'Clube',
    cargo: 'Login do clube — Palmas HC',
    scopes: [],
    ativo: true,
  },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

const NIVEL_FILTROS: (Nivel | 'Todos')[] = ['Todos', 'DEV', 'Master', 'Comitê', 'Clube'];

// ----------------------------------------------------------------------------
// Sub-componentes
// ----------------------------------------------------------------------------
function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${className}`}>{children}</span>
  );
}

function Selo() {
  return (
    <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
      demonstração
    </span>
  );
}

function ScopePills({ scopes }: { scopes: Scope[] }) {
  if (scopes.length === 0) {
    return <span className="font-body text-gray-soft/60 text-xs italic">— sem áreas —</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {scopes.map((key) => {
        const meta = SCOPE_MAP[key];
        const Icon = meta.icon;
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 font-body text-[11px] px-2 py-0.5 rounded-full border border-federation/30 text-blue-300 bg-blue-mid/10"
          >
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function ScopeToggle({
  meta,
  ativo,
  onToggle,
}: {
  meta: ScopeMeta;
  ativo: boolean;
  onToggle: () => void;
}) {
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-3 text-left rounded-lg border px-4 py-3 transition-colors duration-150 ${
        ativo
          ? 'border-gold/50 bg-gold/5'
          : 'border-federation/20 bg-[#0d1b2a]/60 hover:border-federation/50'
      }`}
    >
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
          ativo ? 'bg-gold/15 text-gold' : 'bg-federation/10 text-gray-soft'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="flex-1">
        <span className="block font-display text-fht-white text-sm tracking-wide">{meta.label}</span>
        <span className="block font-body text-gray-soft text-xs">{meta.descricao}</span>
      </span>
      <span
        className={`flex items-center justify-center w-5 h-5 rounded border shrink-0 ${
          ativo ? 'bg-gold border-gold text-night' : 'border-federation/40 text-transparent'
        }`}
      >
        <Check className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-soft absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------------------
export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<AdminUser[]>(USUARIOS_MOCK);
  const [busca, setBusca] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<Nivel | 'Todos'>('Todos');

  // modais
  const [editando, setEditando] = useState<AdminUser | null>(null);
  const [draftScopes, setDraftScopes] = useState<Scope[]>([]);
  const [draftAtivo, setDraftAtivo] = useState(true);

  const [novoAdminOpen, setNovoAdminOpen] = useState(false);
  const [naNome, setNaNome] = useState('');
  const [naEmail, setNaEmail] = useState('');
  const [naNivel, setNaNivel] = useState<Nivel>('Comitê');
  const [naScopes, setNaScopes] = useState<Scope[]>([]);

  const [loginClubeOpen, setLoginClubeOpen] = useState(false);
  const [lcClube, setLcClube] = useState(CLUBES_APROVADOS[0]);
  const [lcEmail, setLcEmail] = useState('');
  const [lcSenha, setLcSenha] = useState('');

  const filtrados = usuarios.filter((u) => {
    const termo = busca.trim().toLowerCase();
    const casaBusca =
      termo === '' ||
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      u.cargo.toLowerCase().includes(termo);
    const casaNivel = filtroNivel === 'Todos' || u.nivel === filtroNivel;
    return casaBusca && casaNivel;
  });

  const totalAtivos = usuarios.filter((u) => u.ativo).length;
  const totalComite = usuarios.filter((u) => u.nivel === 'Comitê').length;

  function abrirPermissoes(u: AdminUser) {
    setEditando(u);
    setDraftScopes([...u.scopes]);
    setDraftAtivo(u.ativo);
  }

  function salvarPermissoes() {
    if (!editando) return;
    setUsuarios((prev) =>
      prev.map((u) => (u.id === editando.id ? { ...u, scopes: draftScopes, ativo: draftAtivo } : u)),
    );
    setEditando(null);
  }

  function removerUsuario(id: number) {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }

  function criarNovoAdmin() {
    setUsuarios((prev) => [
      ...prev,
      {
        id: prev.reduce((max, u) => Math.max(max, u.id), 0) + 1,
        nome: naNome.trim() || 'Novo administrador',
        email: naEmail.trim() || 'novo@fht.org.br',
        nivel: naNivel,
        cargo: naNivel === 'Comitê' ? 'Membro do comitê' : NIVEL_LABEL[naNivel],
        scopes: naNivel === 'Comitê' ? naScopes : naNivel === 'Clube' ? [] : [...ALL_SCOPES],
        ativo: true,
      },
    ]);
    setNaNome('');
    setNaEmail('');
    setNaNivel('Comitê');
    setNaScopes([]);
    setNovoAdminOpen(false);
  }

  function criarLoginClube() {
    setUsuarios((prev) => [
      ...prev,
      {
        id: prev.reduce((max, u) => Math.max(max, u.id), 0) + 1,
        nome: lcClube,
        email: lcEmail.trim() || `contato@${lcClube.toLowerCase().replace(/\s+/g, '')}.com.br`,
        nivel: 'Clube',
        cargo: `Login do clube — ${lcClube}`,
        scopes: [],
        ativo: true,
      },
    ]);
    setLcEmail('');
    setLcSenha('');
    setLcClube(CLUBES_APROVADOS[0]);
    setLoginClubeOpen(false);
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-fht-white text-3xl">USUÁRIOS &amp; ADMINS</h2>
            <Selo />
          </div>
          <p className="font-body text-gray-soft text-sm mt-1">
            Gestão de acessos e hierarquia de administradores da federação.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setNovoAdminOpen(true)}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo admin
          </button>
          <button
            type="button"
            onClick={() => setLoginClubeOpen(true)}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Criar login de clube
          </button>
        </div>
      </div>

      {/* Card de hierarquia */}
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-gold text-xs tracking-widest">HIERARQUIA DE ACESSO</p>
          <span className="font-body text-gray-soft text-xs">
            {usuarios.length} usuários · {totalAtivos} ativos · {totalComite} no comitê
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
          {HIERARQUIA.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.nivel} className="flex items-center gap-3 lg:flex-1">
                <div className="flex-1 h-full bg-[#0a1628] border border-federation/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-federation/15 text-gold shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <Badge className={NIVEL_BADGE[item.nivel]}>{NIVEL_LABEL[item.nivel]}</Badge>
                  </div>
                  <p className="font-display text-fht-white text-sm tracking-wide mb-1">{item.titulo}</p>
                  <p className="font-body text-gray-soft text-xs leading-relaxed">{item.descricao}</p>
                </div>
                {i < HIERARQUIA.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-federation/50 shrink-0 rotate-90 lg:rotate-0 mx-auto" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou cargo…"
            className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {NIVEL_FILTROS.map((n) => {
            const ativo = filtroNivel === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setFiltroNivel(n)}
                className={`font-display text-xs tracking-wider px-3.5 py-2 rounded-lg border transition-colors duration-150 ${
                  ativo
                    ? 'text-night bg-gold border-gold'
                    : 'text-gray-soft border-federation/30 hover:border-federation/60'
                }`}
              >
                {n === 'Todos' ? 'TODOS' : NIVEL_LABEL[n as Nivel].toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-federation/20">
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                Usuário
              </th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                Nível
              </th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                Áreas / Scopes
              </th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">
                Status
              </th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((u) => (
              <tr
                key={u.id}
                className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150"
              >
                <td className="px-4 py-3">
                  <p className="font-body text-fht-white text-sm">{u.nome}</p>
                  <p className="font-body text-gray-soft text-xs">{u.email}</p>
                  <p className="font-body text-gray-soft/70 text-xs mt-0.5">{u.cargo}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={NIVEL_BADGE[u.nivel]}>{NIVEL_LABEL[u.nivel]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <ScopePills scopes={u.scopes} />
                </td>
                <td className="px-4 py-3">
                  {u.ativo ? (
                    <Badge className="text-green-400 bg-green-500/10 border-green-500/30">Ativo</Badge>
                  ) : (
                    <Badge className="text-gray-soft bg-gray-soft/10 border-gray-soft/30">Inativo</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => abrirPermissoes(u)}
                      className="inline-flex items-center gap-1.5 font-body text-xs text-blue-300 border border-blue-400/30 bg-blue-mid/10 hover:bg-blue-mid/20 px-3 py-1.5 rounded-lg transition-colors duration-150"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Permissões
                    </button>
                    <button
                      type="button"
                      disabled={u.nivel === 'DEV'}
                      onClick={() => removerUsuario(u.id)}
                      title={u.nivel === 'DEV' ? 'O DEV/Dono não pode ser removido' : 'Remover usuário'}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors duration-150 border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center font-body text-gray-soft text-sm">
                  Nenhum usuário encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Slide-over: Editar permissões */}
      {/* ---------------------------------------------------------------- */}
      {editando && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setEditando(null)}>
          <div className="flex-1 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <div
            className="w-full max-w-2xl h-full bg-[#0a1628] border-l border-federation/20 overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-federation/20 sticky top-0 bg-[#0a1628] z-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-display text-gold text-xs tracking-widest">EDITAR PERMISSÕES</p>
                  <Selo />
                </div>
                <p className="font-display text-fht-white text-2xl tracking-wide">{editando.nome}</p>
                <p className="font-body text-gray-soft text-sm">
                  {editando.email} · {editando.cargo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="text-gray-soft hover:text-fht-white transition-colors duration-150"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6">
              {/* Nível */}
              <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                <p className="font-display text-gold text-xs tracking-widest mb-4">NÍVEL DE ACESSO</p>
                <div className="flex items-center gap-3">
                  <Badge className={NIVEL_BADGE[editando.nivel]}>{NIVEL_LABEL[editando.nivel]}</Badge>
                  <span className="font-body text-gray-soft text-xs">
                    {editando.nivel === 'DEV' && 'Vê e altera tudo de todos.'}
                    {editando.nivel === 'Master' && 'Comanda os demais admins do comitê.'}
                    {editando.nivel === 'Comitê' && 'Permissões restritas às áreas marcadas abaixo.'}
                    {editando.nivel === 'Clube' && 'Acesso limitado ao próprio clube.'}
                  </span>
                </div>
                {(editando.nivel === 'DEV' || editando.nivel === 'Master') && (
                  <p className="font-body text-gold/80 text-xs mt-3">
                    Este nível já possui acesso total — os escopos abaixo são apenas ilustrativos.
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                <p className="font-display text-gold text-xs tracking-widest mb-4">STATUS DO LOGIN</p>
                <button
                  type="button"
                  onClick={() => setDraftAtivo((v) => !v)}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      draftAtivo ? 'bg-green-500/70' : 'bg-federation/40'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-fht-white transition-transform duration-200 ${
                        draftAtivo ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </span>
                  <span className="font-body text-fht-white text-sm">
                    {draftAtivo ? 'Login ativo' : 'Login inativo'}
                  </span>
                </button>
              </div>

              {/* Scopes por área */}
              <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display text-gold text-xs tracking-widest">PERMISSÕES POR ÁREA</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftScopes([...ALL_SCOPES])}
                      className="font-body text-xs text-gray-soft hover:text-gold transition-colors duration-150"
                    >
                      Marcar todas
                    </button>
                    <span className="text-federation/40">·</span>
                    <button
                      type="button"
                      onClick={() => setDraftScopes([])}
                      className="font-body text-xs text-gray-soft hover:text-gold transition-colors duration-150"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {SCOPES.map((meta) => (
                    <ScopeToggle
                      key={meta.key}
                      meta={meta}
                      ativo={draftScopes.includes(meta.key)}
                      onToggle={() => setDraftScopes((prev) => toggleInArray(prev, meta.key))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0a1628] border-t border-federation/20 p-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={salvarPermissoes}
                className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Salvar permissões
              </button>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Modal: Novo admin */}
      {/* ---------------------------------------------------------------- */}
      {novoAdminOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setNovoAdminOpen(false)}
        >
          <div
            className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-federation/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="font-display text-fht-white text-lg tracking-wide">NOVO ADMIN</p>
                <Selo />
              </div>
              <button
                type="button"
                onClick={() => setNovoAdminOpen(false)}
                className="text-gray-soft hover:text-fht-white transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <label className="block">
                <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                  Nome completo
                </span>
                <input
                  value={naNome}
                  onChange={(e) => setNaNome(e.target.value)}
                  placeholder="Ex.: Ana Beatriz Ferreira"
                  className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
                />
              </label>
              <label className="block">
                <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                  E-mail de acesso
                </span>
                <input
                  value={naEmail}
                  onChange={(e) => setNaEmail(e.target.value)}
                  placeholder="nome@fht.org.br"
                  className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
                />
              </label>
              <label className="block">
                <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                  Nível
                </span>
                <Select value={naNivel} onChange={(v) => setNaNivel(v as Nivel)}>
                  <option value="Master">Admin Master (Presidência)</option>
                  <option value="Comitê">Comitê / Diretoria</option>
                </Select>
              </label>
              {naNivel === 'Comitê' && (
                <div>
                  <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-2 block">
                    Áreas do comitê
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SCOPES.map((meta) => {
                      const on = naScopes.includes(meta.key);
                      const Icon = meta.icon;
                      return (
                        <button
                          key={meta.key}
                          type="button"
                          onClick={() => setNaScopes((prev) => toggleInArray(prev, meta.key))}
                          className={`inline-flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-full border transition-colors duration-150 ${
                            on
                              ? 'text-gold bg-gold/10 border-gold/40'
                              : 'text-gray-soft border-federation/30 hover:border-federation/60'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 flex gap-3 border-t border-federation/20">
              <button
                type="button"
                onClick={criarNovoAdmin}
                className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar admin
              </button>
              <button
                type="button"
                onClick={() => setNovoAdminOpen(false)}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Modal: Criar login de clube */}
      {/* ---------------------------------------------------------------- */}
      {loginClubeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setLoginClubeOpen(false)}
        >
          <div
            className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-federation/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="font-display text-fht-white text-lg tracking-wide">CRIAR LOGIN DE CLUBE</p>
                <Selo />
              </div>
              <button
                type="button"
                onClick={() => setLoginClubeOpen(false)}
                className="text-gray-soft hover:text-fht-white transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="font-body text-gray-soft text-xs leading-relaxed">
                O login dá ao clube acesso <span className="text-fht-white">apenas ao próprio painel</span>{' '}
                (ADMIN_CLUBE): cadastra atletas, mas não aprova filiações.
              </p>
              <label className="block">
                <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                  Clube aprovado
                </span>
                <Select value={lcClube} onChange={setLcClube}>
                  {CLUBES_APROVADOS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                  E-mail do responsável
                </span>
                <input
                  value={lcEmail}
                  onChange={(e) => setLcEmail(e.target.value)}
                  placeholder="contato@clube.com.br"
                  className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
                />
              </label>
              <label className="block">
                <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                  Senha inicial
                </span>
                <input
                  value={lcSenha}
                  onChange={(e) => setLcSenha(e.target.value)}
                  placeholder="Senha provisória (o clube troca no 1º acesso)"
                  className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
                />
              </label>
            </div>
            <div className="p-5 flex gap-3 border-t border-federation/20">
              <button
                type="button"
                onClick={criarLoginClube}
                className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Criar login
              </button>
              <button
                type="button"
                onClick={() => setLoginClubeOpen(false)}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
