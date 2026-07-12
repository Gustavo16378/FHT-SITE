import { useState, type ReactNode } from 'react';
import {
  Plus,
  X,
  Search,
  Pencil,
  Trash2,
  Upload,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Newspaper,
  Calendar,
  Eye,
} from 'lucide-react';

// ----------------------------- Tipos -----------------------------
type Categoria = 'Institucional' | 'Competição' | 'Arbitragem' | 'Seleção';
type Status = 'Publicado' | 'Rascunho';

interface Noticia {
  id: number;
  titulo: string;
  categoria: Categoria;
  data: string;
  status: Status;
  resumo: string;
  gradiente: string;
}

const CATEGORIAS: Categoria[] = ['Institucional', 'Competição', 'Arbitragem', 'Seleção'];

// Gradiente da "capa" por categoria (sem imagem externa)
const GRADIENTE_POR_CATEGORIA: Record<Categoria, string> = {
  Institucional: 'from-federation to-blue-mid',
  Competição: 'from-[#F5C518] to-[#b8850a]',
  Arbitragem: 'from-blue-mid to-federation',
  Seleção: 'from-green-600 to-federation',
};

// Classe do badge de categoria (segue a paleta do design system)
const BADGE_CATEGORIA: Record<Categoria, string> = {
  Institucional: 'text-blue-300 bg-blue-mid/10 border-blue-400/30',
  Competição: 'text-gold bg-gold/10 border-gold/30',
  Arbitragem: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Seleção: 'text-green-400 bg-green-500/10 border-green-500/30',
};

const BADGE_STATUS: Record<Status, string> = {
  Publicado: 'text-green-400 bg-green-500/10 border-green-500/30',
  Rascunho: 'text-gray-soft bg-gray-soft/10 border-gray-soft/30',
};

// ----------------------------- Mock -----------------------------
const NOTICIAS_INICIAIS: Noticia[] = [
  {
    id: 1,
    titulo: 'FHT lança calendário oficial 2025 com 8 competições estaduais',
    categoria: 'Institucional',
    data: '02 de mai. de 2025',
    status: 'Publicado',
    resumo:
      'Presidência apresenta o calendário anual em Palmas; temporada abre com a Copa Tocantins de base em junho.',
    gradiente: GRADIENTE_POR_CATEGORIA['Institucional'],
  },
  {
    id: 2,
    titulo: 'Curso de formação de árbitros abre vagas para todo o estado',
    categoria: 'Arbitragem',
    data: '18 de abr. de 2025',
    status: 'Publicado',
    resumo:
      'Inscrições até 30/04 para novos árbitros de handebol; formação teórica e prática com aval da CBHb.',
    gradiente: GRADIENTE_POR_CATEGORIA['Arbitragem'],
  },
  {
    id: 3,
    titulo: 'Palmas HC e Araguaína HC decidem a final adulta em Gurupi',
    categoria: 'Competição',
    data: '11 de abr. de 2025',
    status: 'Publicado',
    resumo:
      'Clássico do handebol tocantinense define o campeão estadual adulto no ginásio Ayrton Senna.',
    gradiente: GRADIENTE_POR_CATEGORIA['Competição'],
  },
  {
    id: 4,
    titulo: 'Seleção Tocantinense Sub-16 convoca atletas para peneira',
    categoria: 'Seleção',
    data: '29 de mar. de 2025',
    status: 'Rascunho',
    resumo:
      'Comissão técnica lista 24 nomes de seis clubes filiados; treino de avaliação marcado para Porto Nacional.',
    gradiente: GRADIENTE_POR_CATEGORIA['Seleção'],
  },
  {
    id: 5,
    titulo: 'Assembleia geral aprova novo estatuto e taxa de anuidade 2025',
    categoria: 'Institucional',
    data: '14 de mar. de 2025',
    status: 'Rascunho',
    resumo:
      'Clubes filiados aprovam ajustes no estatuto e o valor da anuidade que habilita atletas às competições do ano.',
    gradiente: GRADIENTE_POR_CATEGORIA['Institucional'],
  },
];

const HOJE = '12 de jul. de 2026';

// ----------------------------- Editor -----------------------------
interface FormNoticia {
  titulo: string;
  categoria: Categoria;
  corpo: string;
  status: Status;
}

interface EditorProps {
  editando: Noticia | null;
  onCancelar: () => void;
  onSalvar: (dados: FormNoticia, id: number | null) => void;
}

function EditorNoticia({ editando, onCancelar, onSalvar }: EditorProps) {
  const [form, setForm] = useState<FormNoticia>({
    titulo: editando?.titulo ?? '',
    categoria: editando?.categoria ?? 'Institucional',
    corpo: editando?.resumo ?? '',
    status: editando?.status ?? 'Rascunho',
  });

  const atualizar = <K extends keyof FormNoticia>(campo: K, valor: FormNoticia[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const ferramentas: { icon: typeof Bold; label: string }[] = [
    { icon: Bold, label: 'Negrito' },
    { icon: Italic, label: 'Itálico' },
    { icon: LinkIcon, label: 'Link' },
    { icon: ImageIcon, label: 'Imagem' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onCancelar}
    >
      <div
        className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="p-5 border-b border-federation/20 flex items-start justify-between sticky top-0 bg-[#0a1628] z-10">
          <div>
            <h3 className="font-display text-fht-white text-2xl tracking-wide">
              {editando ? 'EDITAR NOTÍCIA' : 'NOVA NOTÍCIA'}
            </h3>
            <p className="font-body text-gray-soft text-xs mt-1">
              Escreva, escolha a categoria e publique no site.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Fechar editor"
            className="text-gray-soft hover:text-fht-white transition-colors duration-150"
          >
            <X size={22} />
          </button>
        </div>

        {/* corpo */}
        <div className="p-5 flex flex-col gap-4">
          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Título
            </span>
            <input
              value={form.titulo}
              onChange={(e) => atualizar('titulo', e.target.value)}
              placeholder="Ex.: FHT divulga tabela do Estadual 2025"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
          </label>

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Categoria
            </span>
            <select
              value={form.categoria}
              onChange={(e) => atualizar('categoria', e.target.value as Categoria)}
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c} className="bg-[#0a1628]">
                  {c}
                </option>
              ))}
            </select>
          </label>

          {/* capa - upload mock */}
          <div className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Capa
            </span>
            <div className="border border-dashed border-federation/30 hover:border-federation/60 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-150 bg-[#0d1b2a]/40">
              <Upload size={26} className="text-gold mb-2" />
              <p className="font-body text-fht-white text-sm">
                Arraste uma imagem ou clique para enviar
              </p>
              <p className="font-body text-gray-soft text-xs mt-1">
                JPG ou PNG até 5 MB — proporção 16:9 recomendada
              </p>
            </div>
          </div>

          {/* corpo - WYSIWYG fake */}
          <div className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Corpo
            </span>
            <div className="border border-federation/20 rounded-lg overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-2 border-b border-federation/20 bg-[#0d1b2a]/80">
                {ferramentas.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    aria-label={f.label}
                    className="w-8 h-8 flex items-center justify-center rounded text-gray-soft hover:text-gold hover:bg-federation/20 transition-colors duration-150"
                  >
                    <f.icon size={16} />
                  </button>
                ))}
                <span className="ml-auto font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
                  demonstração
                </span>
              </div>
              <textarea
                value={form.corpo}
                onChange={(e) => atualizar('corpo', e.target.value)}
                rows={7}
                placeholder="Escreva o conteúdo da notícia..."
                className="font-body bg-[#0d1b2a]/80 rounded-none px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full resize-y border-0"
              />
            </div>
          </div>

          {/* toggle status */}
          <div className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Situação
            </span>
            <div className="inline-flex rounded-lg border border-federation/20 overflow-hidden">
              {(['Rascunho', 'Publicado'] as Status[]).map((s) => {
                const ativo = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => atualizar('status', s)}
                    className={`font-display text-sm tracking-wider px-5 py-2.5 transition-colors duration-150 ${
                      ativo
                        ? s === 'Publicado'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-soft/15 text-fht-white'
                        : 'text-gray-soft hover:text-fht-white'
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-federation/20 flex gap-3 justify-end sticky bottom-0 bg-[#0a1628]">
          <button
            type="button"
            onClick={onCancelar}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={() => onSalvar(form, editando?.id ?? null)}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
          >
            {editando ? 'SALVAR ALTERAÇÕES' : 'SALVAR NOTÍCIA'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------- Página -----------------------------
export function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>(NOTICIAS_INICIAIS);
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'Todas'>('Todas');
  const [statusFiltro, setStatusFiltro] = useState<Status | 'Todos'>('Todos');
  const [busca, setBusca] = useState('');
  const [editorAberto, setEditorAberto] = useState(false);
  const [editando, setEditando] = useState<Noticia | null>(null);
  const [proximoId, setProximoId] = useState(6);

  const abrirNova = () => {
    setEditando(null);
    setEditorAberto(true);
  };

  const abrirEdicao = (n: Noticia) => {
    setEditando(n);
    setEditorAberto(true);
  };

  const fecharEditor = () => {
    setEditorAberto(false);
    setEditando(null);
  };

  const deletar = (id: number) => setNoticias((lista) => lista.filter((n) => n.id !== id));

  const salvar = (dados: FormNoticia, id: number | null) => {
    if (id === null) {
      const nova: Noticia = {
        id: proximoId,
        titulo: dados.titulo.trim() || 'Notícia sem título',
        categoria: dados.categoria,
        data: HOJE,
        status: dados.status,
        resumo: dados.corpo.trim() || 'Sem conteúdo.',
        gradiente: GRADIENTE_POR_CATEGORIA[dados.categoria],
      };
      setNoticias((lista) => [nova, ...lista]);
      setProximoId((v) => v + 1);
    } else {
      setNoticias((lista) =>
        lista.map((n) =>
          n.id === id
            ? {
                ...n,
                titulo: dados.titulo.trim() || n.titulo,
                categoria: dados.categoria,
                status: dados.status,
                resumo: dados.corpo.trim() || n.resumo,
                gradiente: GRADIENTE_POR_CATEGORIA[dados.categoria],
              }
            : n,
        ),
      );
    }
    fecharEditor();
  };

  const filtradas = noticias.filter((n) => {
    const okCat = categoriaFiltro === 'Todas' || n.categoria === categoriaFiltro;
    const okStatus = statusFiltro === 'Todos' || n.status === statusFiltro;
    const okBusca = n.titulo.toLowerCase().includes(busca.trim().toLowerCase());
    return okCat && okStatus && okBusca;
  });

  const totalPublicadas = noticias.filter((n) => n.status === 'Publicado').length;
  const totalRascunhos = noticias.filter((n) => n.status === 'Rascunho').length;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-fht-white text-3xl">NOTÍCIAS</h2>
          <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
            demonstração
          </span>
        </div>
        <button
          type="button"
          onClick={abrirNova}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
        >
          <Plus size={18} />
          NOVA NOTÍCIA
        </button>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <ResumoCard icon={Newspaper} rotulo="Total" valor={noticias.length} cor="text-blue-300" />
        <ResumoCard icon={Eye} rotulo="Publicadas" valor={totalPublicadas} cor="text-green-400" />
        <ResumoCard icon={Pencil} rotulo="Rascunhos" valor={totalRascunhos} cor="text-gray-soft" />
      </div>

      {/* Filtros */}
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 mb-6">
        <p className="font-display text-gold text-xs tracking-widest mb-4">FILTROS</p>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            <PillFiltro
              ativo={categoriaFiltro === 'Todas'}
              onClick={() => setCategoriaFiltro('Todas')}
            >
              Todas
            </PillFiltro>
            {CATEGORIAS.map((c) => (
              <PillFiltro
                key={c}
                ativo={categoriaFiltro === c}
                onClick={() => setCategoriaFiltro(c)}
              >
                {c}
              </PillFiltro>
            ))}
          </div>

          <div className="hidden lg:block h-6 w-px bg-federation/20" />

          {/* Status */}
          <div className="flex flex-wrap gap-2">
            {(['Todos', 'Publicado', 'Rascunho'] as (Status | 'Todos')[]).map((s) => (
              <PillFiltro key={s} ativo={statusFiltro === s} onClick={() => setStatusFiltro(s)}>
                {s}
              </PillFiltro>
            ))}
          </div>

          {/* Busca */}
          <div className="relative lg:ml-auto w-full lg:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-soft pointer-events-none"
            />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título..."
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-4">
        {filtradas.map((n) => (
          <div
            key={n.id}
            className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-federation/40 transition-colors duration-150"
          >
            {/* miniatura */}
            <div
              className={`w-full sm:w-44 h-28 rounded-lg bg-gradient-to-br ${n.gradiente} flex-shrink-0 flex items-end p-3`}
            >
              <Newspaper size={22} className="text-white/80" />
            </div>

            {/* conteúdo */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`font-body text-xs px-2.5 py-1 rounded-full border ${BADGE_CATEGORIA[n.categoria]}`}
                >
                  {n.categoria}
                </span>
                <span
                  className={`font-body text-xs px-2.5 py-1 rounded-full border ${BADGE_STATUS[n.status]}`}
                >
                  {n.status}
                </span>
                <span className="font-body text-gray-soft text-xs flex items-center gap-1">
                  <Calendar size={13} />
                  {n.data}
                </span>
              </div>

              <h3 className="font-display text-fht-white text-lg leading-snug tracking-wide">
                {n.titulo}
              </h3>
              <p className="font-body text-gray-soft text-sm mt-1 line-clamp-2">{n.resumo}</p>

              {/* ações */}
              <div className="flex items-center gap-2 mt-auto pt-3">
                <button
                  type="button"
                  onClick={() => abrirEdicao(n)}
                  className="font-body text-gray-soft hover:text-gold border border-federation/30 hover:border-gold/50 px-3 py-1.5 rounded-lg text-xs tracking-wider transition-colors duration-150 flex items-center gap-1.5"
                >
                  <Pencil size={14} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => deletar(n.id)}
                  className="font-body text-gray-soft hover:text-red-400 border border-federation/30 hover:border-red-500/50 px-3 py-1.5 rounded-lg text-xs tracking-wider transition-colors duration-150 flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtradas.length === 0 && (
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 text-center">
            <Newspaper size={34} className="text-gray-soft/50 mx-auto mb-3" />
            <p className="font-body text-gray-soft text-sm">
              Nenhuma notícia encontrada com os filtros atuais.
            </p>
          </div>
        )}
      </div>

      {/* Editor */}
      {editorAberto && (
        <EditorNoticia editando={editando} onCancelar={fecharEditor} onSalvar={salvar} />
      )}
    </div>
  );
}

// ----------------------------- Sub-componentes -----------------------------
interface PillFiltroProps {
  ativo: boolean;
  onClick: () => void;
  children: ReactNode;
}

function PillFiltro({ ativo, onClick, children }: PillFiltroProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors duration-150 ${
        ativo
          ? 'text-gold bg-gold/10 border-gold/40'
          : 'text-gray-soft bg-transparent border-federation/30 hover:border-federation/60'
      }`}
    >
      {children}
    </button>
  );
}

interface ResumoCardProps {
  icon: typeof Newspaper;
  rotulo: string;
  valor: number;
  cor: string;
}

function ResumoCard({ icon: Icon, rotulo, valor, cor }: ResumoCardProps) {
  return (
    <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-federation/15 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className={cor} />
      </div>
      <div>
        <p className="font-display text-fht-white text-2xl leading-none">{valor}</p>
        <p className="font-body text-gray-soft text-xs uppercase tracking-wider mt-1">{rotulo}</p>
      </div>
    </div>
  );
}
