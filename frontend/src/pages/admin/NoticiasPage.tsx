import { useEffect, useState, type ReactNode } from 'react';
import {
  Plus,
  X,
  Search,
  Pencil,
  Trash2,
  Upload,
  Newspaper,
  Calendar,
  Eye,
  Star,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { apiGet, apiPostJson, apiPut, apiDelete, apiPostForm, fileUrl } from '../../services/api';
import type { NoticiaDTO, NoticiaCategoria, NoticiaStatus, UploadResponse } from '../../types/api';

// ----------------------------- Constantes -----------------------------
const CATEGORIAS: NoticiaCategoria[] = ['Institucional', 'Competição', 'Arbitragem', 'Seleção'];

// Gradiente da "capa" por categoria (fallback quando a notícia não tem imagem)
const GRADIENTE_POR_CATEGORIA: Record<NoticiaCategoria, string> = {
  Institucional: 'from-federation to-blue-mid',
  Competição: 'from-[#F5C518] to-[#b8850a]',
  Arbitragem: 'from-blue-mid to-federation',
  Seleção: 'from-green-600 to-federation',
};

const BADGE_CATEGORIA: Record<NoticiaCategoria, string> = {
  Institucional: 'text-blue-300 bg-blue-mid/10 border-blue-400/30',
  Competição: 'text-gold bg-gold/10 border-gold/30',
  Arbitragem: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Seleção: 'text-green-400 bg-green-500/10 border-green-500/30',
};

const BADGE_STATUS: Record<NoticiaStatus, string> = {
  PUBLICADO: 'text-green-400 bg-green-500/10 border-green-500/30',
  RASCUNHO: 'text-gray-soft bg-gray-soft/10 border-gray-soft/30',
};

const ROTULO_STATUS: Record<NoticiaStatus, string> = {
  PUBLICADO: 'Publicado',
  RASCUNHO: 'Rascunho',
};

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatarData(iso: string): string {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ----------------------------- Editor -----------------------------
interface FormNoticia {
  titulo: string;
  categoria: NoticiaCategoria;
  resumo: string;
  conteudo: string;
  imagemCapaUrl: string;
  dataPublicacao: string;
  destaque: boolean;
  status: NoticiaStatus;
}

interface EditorProps {
  editando: NoticiaDTO | null;
  salvando: boolean;
  onCancelar: () => void;
  onSalvar: (dados: FormNoticia, id: string | null) => void;
}

function EditorNoticia({ editando, salvando, onCancelar, onSalvar }: EditorProps) {
  const [form, setForm] = useState<FormNoticia>({
    titulo: editando?.titulo ?? '',
    categoria: editando?.categoria ?? 'Institucional',
    resumo: editando?.resumo ?? '',
    conteudo: editando?.conteudo ?? '',
    imagemCapaUrl: editando?.imagemCapaUrl ?? '',
    dataPublicacao: editando?.dataPublicacao ?? hojeISO(),
    destaque: editando?.destaque ?? false,
    status: editando?.status ?? 'RASCUNHO',
  });
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [erroCapa, setErroCapa] = useState('');

  const atualizar = <K extends keyof FormNoticia>(campo: K, valor: FormNoticia[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  async function enviarCapa(file: File) {
    setErroCapa('');
    setEnviandoCapa(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiPostForm<UploadResponse>('/api/noticias/upload-imagem', fd);
      atualizar('imagemCapaUrl', res.url);
    } catch {
      setErroCapa('Falha ao enviar a imagem. Tente novamente.');
    } finally {
      setEnviandoCapa(false);
    }
  }

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

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                Categoria
              </span>
              <select
                value={form.categoria}
                onChange={(e) => atualizar('categoria', e.target.value as NoticiaCategoria)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white text-sm outline-none w-full appearance-none cursor-pointer"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c} className="bg-[#0a1628]">
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                Data de publicação
              </span>
              <input
                type="date"
                value={form.dataPublicacao}
                onChange={(e) => atualizar('dataPublicacao', e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white text-sm outline-none w-full [color-scheme:dark]"
              />
            </label>
          </div>

          {/* capa - upload real + URL colada */}
          <div className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Capa
            </span>
            {form.imagemCapaUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-federation/20">
                <img
                  src={fileUrl(form.imagemCapaUrl)}
                  alt="Capa da notícia"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={() => atualizar('imagemCapaUrl', '')}
                  className="absolute top-2 right-2 bg-night/80 hover:bg-night text-fht-white rounded-full p-1.5"
                  aria-label="Remover capa"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-federation/30 hover:border-federation/60 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-150 bg-[#0d1b2a]/40">
                {enviandoCapa ? (
                  <Loader2 size={26} className="text-gold mb-2 animate-spin" />
                ) : (
                  <Upload size={26} className="text-gold mb-2" />
                )}
                <p className="font-body text-fht-white text-sm">
                  {enviandoCapa ? 'Enviando...' : 'Clique para enviar uma imagem'}
                </p>
                <p className="font-body text-gray-soft text-xs mt-1">
                  JPG ou PNG até 5 MB — proporção 16:9 recomendada
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={enviandoCapa}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void enviarCapa(f);
                  }}
                />
              </label>
            )}
            <input
              value={form.imagemCapaUrl}
              onChange={(e) => atualizar('imagemCapaUrl', e.target.value)}
              placeholder="...ou cole a URL de uma imagem"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-2.5 text-fht-white placeholder-gray-soft text-xs outline-none w-full mt-2"
            />
            {erroCapa && <p className="font-body text-red-400 text-xs mt-1">{erroCapa}</p>}
          </div>

          {/* resumo */}
          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Resumo <span className="text-gray-soft/50 normal-case">(aparece no card)</span>
            </span>
            <textarea
              value={form.resumo}
              onChange={(e) => atualizar('resumo', e.target.value)}
              rows={2}
              placeholder="Uma ou duas frases que resumem a notícia."
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full resize-y"
            />
          </label>

          {/* corpo */}
          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Corpo
            </span>
            <textarea
              value={form.conteudo}
              onChange={(e) => atualizar('conteudo', e.target.value)}
              rows={8}
              placeholder="Escreva o conteúdo completo da notícia..."
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full resize-y"
            />
          </label>

          {/* destaque */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => atualizar('destaque', e.target.checked)}
              className="w-4 h-4 accent-gold"
            />
            <span className="font-body text-fht-white text-sm flex items-center gap-1.5">
              <Star size={15} className="text-gold" /> Destacar na home (card grande)
            </span>
          </label>

          {/* toggle status */}
          <div className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Situação
            </span>
            <div className="inline-flex rounded-lg border border-federation/20 overflow-hidden">
              {(['RASCUNHO', 'PUBLICADO'] as NoticiaStatus[]).map((s) => {
                const ativo = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => atualizar('status', s)}
                    className={`font-display text-sm tracking-wider px-5 py-2.5 transition-colors duration-150 ${
                      ativo
                        ? s === 'PUBLICADO'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-soft/15 text-fht-white'
                        : 'text-gray-soft hover:text-fht-white'
                    }`}
                  >
                    {ROTULO_STATUS[s].toUpperCase()}
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
            disabled={salvando || enviandoCapa}
            onClick={() => onSalvar(form, editando?.id ?? null)}
            className="font-display text-night bg-gold hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
          >
            {salvando && <Loader2 size={16} className="animate-spin" />}
            {editando ? 'SALVAR ALTERAÇÕES' : 'SALVAR NOTÍCIA'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------- Página -----------------------------
export function NoticiasPage() {
  const [noticias, setNoticias] = useState<NoticiaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [categoriaFiltro, setCategoriaFiltro] = useState<NoticiaCategoria | 'Todas'>('Todas');
  const [statusFiltro, setStatusFiltro] = useState<NoticiaStatus | 'Todos'>('Todos');
  const [busca, setBusca] = useState('');
  const [editorAberto, setEditorAberto] = useState(false);
  const [editando, setEditando] = useState<NoticiaDTO | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const lista = await apiGet<NoticiaDTO[]>('/api/noticias/gerenciar');
      setNoticias(lista);
    } catch {
      setErro('Não foi possível carregar as notícias.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const abrirNova = () => {
    setEditando(null);
    setEditorAberto(true);
  };

  const abrirEdicao = (n: NoticiaDTO) => {
    setEditando(n);
    setEditorAberto(true);
  };

  const fecharEditor = () => {
    setEditorAberto(false);
    setEditando(null);
  };

  async function deletar(n: NoticiaDTO) {
    if (!window.confirm(`Deletar a notícia "${n.titulo}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await apiDelete(`/api/noticias/${n.id}`);
      setNoticias((lista) => lista.filter((x) => x.id !== n.id));
    } catch {
      setErro('Não foi possível deletar a notícia.');
    }
  }

  async function salvar(dados: FormNoticia, id: string | null) {
    setSalvando(true);
    setErro('');
    const payload = {
      titulo: dados.titulo.trim(),
      categoria: dados.categoria,
      resumo: dados.resumo.trim() || null,
      conteudo: dados.conteudo.trim() || null,
      imagemCapaUrl: dados.imagemCapaUrl.trim() || null,
      dataPublicacao: dados.dataPublicacao || null,
      destaque: dados.destaque,
      status: dados.status,
    };
    try {
      if (id === null) {
        const criada = await apiPostJson<NoticiaDTO>('/api/noticias', payload);
        setNoticias((lista) => [criada, ...lista]);
      } else {
        const atualizada = await apiPut<NoticiaDTO>(`/api/noticias/${id}`, payload);
        setNoticias((lista) => lista.map((x) => (x.id === id ? atualizada : x)));
      }
      fecharEditor();
    } catch {
      setErro('Não foi possível salvar. Verifique o título e a categoria.');
    } finally {
      setSalvando(false);
    }
  }

  const filtradas = noticias.filter((n) => {
    const okCat = categoriaFiltro === 'Todas' || n.categoria === categoriaFiltro;
    const okStatus = statusFiltro === 'Todos' || n.status === statusFiltro;
    const okBusca = n.titulo.toLowerCase().includes(busca.trim().toLowerCase());
    return okCat && okStatus && okBusca;
  });

  const totalPublicadas = noticias.filter((n) => n.status === 'PUBLICADO').length;
  const totalRascunhos = noticias.filter((n) => n.status === 'RASCUNHO').length;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-fht-white text-3xl">NOTÍCIAS</h2>
        <button
          type="button"
          onClick={abrirNova}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
        >
          <Plus size={18} />
          NOVA NOTÍCIA
        </button>
      </div>

      {erro && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 mb-6 font-body text-sm">
          <AlertCircle size={16} /> {erro}
        </div>
      )}

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
          <div className="flex flex-wrap gap-2">
            <PillFiltro ativo={categoriaFiltro === 'Todas'} onClick={() => setCategoriaFiltro('Todas')}>
              Todas
            </PillFiltro>
            {CATEGORIAS.map((c) => (
              <PillFiltro key={c} ativo={categoriaFiltro === c} onClick={() => setCategoriaFiltro(c)}>
                {c}
              </PillFiltro>
            ))}
          </div>

          <div className="hidden lg:block h-6 w-px bg-federation/20" />

          <div className="flex flex-wrap gap-2">
            {(['Todos', 'PUBLICADO', 'RASCUNHO'] as (NoticiaStatus | 'Todos')[]).map((s) => (
              <PillFiltro key={s} ativo={statusFiltro === s} onClick={() => setStatusFiltro(s)}>
                {s === 'Todos' ? 'Todos' : ROTULO_STATUS[s]}
              </PillFiltro>
            ))}
          </div>

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
      {carregando ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 flex items-center justify-center gap-3">
          <Loader2 size={22} className="text-gold animate-spin" />
          <span className="font-body text-gray-soft text-sm">Carregando notícias...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtradas.map((n) => (
            <div
              key={n.id}
              className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-federation/40 transition-colors duration-150"
            >
              {/* miniatura */}
              {n.imagemCapaUrl ? (
                <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={fileUrl(n.imagemCapaUrl)} alt={n.titulo} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className={`w-full sm:w-44 h-28 rounded-lg bg-gradient-to-br ${GRADIENTE_POR_CATEGORIA[n.categoria]} flex-shrink-0 flex items-end p-3`}
                >
                  <Newspaper size={22} className="text-white/80" />
                </div>
              )}

              {/* conteúdo */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${BADGE_CATEGORIA[n.categoria]}`}>
                    {n.categoria}
                  </span>
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${BADGE_STATUS[n.status]}`}>
                    {ROTULO_STATUS[n.status]}
                  </span>
                  {n.destaque && (
                    <span className="font-body text-xs px-2.5 py-1 rounded-full border text-gold bg-gold/10 border-gold/30 flex items-center gap-1">
                      <Star size={12} /> Destaque
                    </span>
                  )}
                  <span className="font-body text-gray-soft text-xs flex items-center gap-1">
                    <Calendar size={13} />
                    {formatarData(n.dataPublicacao)}
                  </span>
                </div>

                <h3 className="font-display text-fht-white text-lg leading-snug tracking-wide">{n.titulo}</h3>
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
                    onClick={() => void deletar(n)}
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
                {noticias.length === 0
                  ? 'Nenhuma notícia ainda. Clique em "Nova notícia" para publicar a primeira.'
                  : 'Nenhuma notícia encontrada com os filtros atuais.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      {editorAberto && (
        <EditorNoticia
          editando={editando}
          salvando={salvando}
          onCancelar={fecharEditor}
          onSalvar={(dados, id) => void salvar(dados, id)}
        />
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
