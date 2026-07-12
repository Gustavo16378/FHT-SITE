import { useState } from 'react';
import {
  FileText,
  Plus,
  X,
  Eye,
  Download,
  Trash2,
  Upload,
  Globe,
  Calendar,
} from 'lucide-react';

type Categoria =
  | 'Estatuto'
  | 'Regulamento'
  | 'Calendário'
  | 'Edital'
  | 'Circular';

type Documento = {
  id: number;
  titulo: string;
  categoria: Categoria;
  publicadoEm: string; // DD/MM/AAAA
  tamanho: string;
  paginas: number;
};

type Filtro = 'Todos' | Categoria;

const CATEGORIAS: Categoria[] = [
  'Estatuto',
  'Regulamento',
  'Calendário',
  'Edital',
  'Circular',
];

const FILTROS: Filtro[] = ['Todos', ...CATEGORIAS];

const badgeCategoria: Record<Categoria, string> = {
  Estatuto: 'text-gold bg-gold/10 border-gold/30',
  Regulamento: 'text-blue-300 bg-blue-mid/10 border-blue-400/30',
  Calendário: 'text-green-400 bg-green-500/10 border-green-500/30',
  Edital: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Circular: 'text-gray-soft bg-gray-soft/10 border-gray-soft/30',
};

const DOCUMENTOS_MOCK: Documento[] = [
  {
    id: 1,
    titulo: 'Estatuto da FHT — Versão 2023',
    categoria: 'Estatuto',
    publicadoEm: '14/03/2023',
    tamanho: '1,8 MB',
    paginas: 24,
  },
  {
    id: 2,
    titulo: 'Regulamento Geral de Competições 2025',
    categoria: 'Regulamento',
    publicadoEm: '10/01/2025',
    tamanho: '2,4 MB',
    paginas: 38,
  },
  {
    id: 3,
    titulo: 'Regulamento Copa FHT Sub-18 Feminino 2025',
    categoria: 'Regulamento',
    publicadoEm: '28/02/2025',
    tamanho: '1,1 MB',
    paginas: 16,
  },
  {
    id: 4,
    titulo: 'Calendário Oficial 2025',
    categoria: 'Calendário',
    publicadoEm: '06/01/2025',
    tamanho: '640 KB',
    paginas: 6,
  },
  {
    id: 5,
    titulo: 'Edital de Credenciamento de Árbitros 2025',
    categoria: 'Edital',
    publicadoEm: '20/02/2025',
    tamanho: '920 KB',
    paginas: 9,
  },
  {
    id: 6,
    titulo: 'Circular nº 01/2025 — Prazo de Transferências',
    categoria: 'Circular',
    publicadoEm: '15/04/2025',
    tamanho: '310 KB',
    paginas: 2,
  },
];

const primarioBtn =
  'font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250';
const secundarioBtn =
  'font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250';

const demoSelo = (
  <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
    demonstração
  </span>
);

export function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>(DOCUMENTOS_MOCK);
  const [filtro, setFiltro] = useState<Filtro>('Todos');
  const [addAberto, setAddAberto] = useState<boolean>(false);
  const [viewerDoc, setViewerDoc] = useState<Documento | null>(null);

  const visiveis =
    filtro === 'Todos'
      ? documentos
      : documentos.filter((d) => d.categoria === filtro);

  function handleDeletar(id: number) {
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
  }

  function handleAdicionar(novo: Documento) {
    setDocumentos((prev) => [novo, ...prev]);
    setAddAberto(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-fht-white text-3xl">DOCUMENTOS</h2>
          {demoSelo}
        </div>
        <button className={primarioBtn} onClick={() => setAddAberto(true)}>
          <span className="inline-flex items-center gap-2">
            <Plus size={16} /> Adicionar documento
          </span>
        </button>
      </div>

      {/* Nota de transparência */}
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-mid/10 border border-blue-400/30 flex items-center justify-center shrink-0">
          <Globe size={18} className="text-blue-300" />
        </div>
        <div>
          <p className="font-body text-fht-white text-sm">
            Todos os documentos institucionais são{' '}
            <span className="text-blue-300">públicos</span> e ficam disponíveis
            na aba de Transparência do site.
          </p>
          <p className="font-body text-gray-soft text-xs mt-1">
            Ao publicar, o arquivo passa a ser visível para qualquer visitante.
          </p>
        </div>
      </div>

      {/* Filtro por categoria */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTROS.map((f) => {
          const ativo = f === filtro;
          return (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={
                'font-body text-xs px-3.5 py-1.5 rounded-full border transition-colors duration-150 ' +
                (ativo
                  ? 'text-night bg-gold border-gold'
                  : 'text-gray-soft bg-transparent border-federation/30 hover:border-federation/60')
              }
            >
              {f}
              {f !== 'Todos' && (
                <span className="ml-1.5 opacity-70">
                  {documentos.filter((d) => d.categoria === f).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de documentos */}
      <div className="flex flex-col gap-3">
        {visiveis.map((doc) => (
          <div
            key={doc.id}
            className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 flex flex-wrap items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-federation/10 border border-federation/20 flex items-center justify-center shrink-0">
              <FileText size={22} className="text-gold" />
            </div>

            <div className="flex-1 min-w-[220px]">
              <p className="font-body text-fht-white text-sm font-medium">
                {doc.titulo}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="font-body text-gray-soft text-xs inline-flex items-center gap-1">
                  <Calendar size={12} /> Publicado em {doc.publicadoEm}
                </span>
                <span className="text-gray-soft/40">·</span>
                <span className="font-body text-gray-soft text-xs">
                  PDF · {doc.tamanho} · {doc.paginas} pág.
                </span>
              </div>
            </div>

            <span
              className={
                'font-body text-xs px-2.5 py-1 rounded-full border ' +
                badgeCategoria[doc.categoria]
              }
            >
              {doc.categoria}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setViewerDoc(doc)}
                title="Visualizar"
                className="font-body text-xs text-gray-soft hover:text-fht-white inline-flex items-center gap-1.5 border border-federation/30 hover:border-federation/60 rounded-lg px-3 py-2 transition-colors duration-150"
              >
                <Eye size={15} /> Visualizar
              </button>
              <button
                title="Baixar"
                className="text-gray-soft hover:text-gold border border-federation/30 hover:border-federation/60 rounded-lg p-2 transition-colors duration-150"
              >
                <Download size={15} />
              </button>
              <button
                onClick={() => handleDeletar(doc.id)}
                title="Deletar"
                className="text-gray-soft hover:text-red-400 border border-federation/30 hover:border-red-500/50 rounded-lg p-2 transition-colors duration-150"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {visiveis.length === 0 && (
          <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 text-center">
            <FileText size={28} className="text-gray-soft/50 mx-auto mb-3" />
            <p className="font-body text-gray-soft text-sm">
              Nenhum documento nesta categoria.
            </p>
          </div>
        )}
      </div>

      {addAberto && (
        <AddDocumentoModal
          onClose={() => setAddAberto(false)}
          onSalvar={handleAdicionar}
        />
      )}

      {viewerDoc && (
        <ViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} />
      )}
    </div>
  );
}

type AddModalProps = {
  onClose: () => void;
  onSalvar: (doc: Documento) => void;
};

function AddDocumentoModal({ onClose, onSalvar }: AddModalProps) {
  const [titulo, setTitulo] = useState<string>('');
  const [categoria, setCategoria] = useState<Categoria>('Regulamento');
  const [arquivo, setArquivo] = useState<string | null>(null);

  const podeEnviar = titulo.trim().length > 0 && arquivo !== null;

  function handleEnviar() {
    if (!podeEnviar) return;
    onSalvar({
      id: Date.now(),
      titulo: titulo.trim(),
      categoria,
      publicadoEm: '12/07/2026',
      tamanho: '1,0 MB',
      paginas: 12,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-federation/20 flex items-center justify-between">
          <h3 className="font-display text-fht-white text-xl tracking-wider">
            ADICIONAR DOCUMENTO
          </h3>
          <button
            onClick={onClose}
            className="text-gray-soft hover:text-fht-white transition-colors duration-150"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Título
            </span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Regulamento Estadual 2026"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
          </label>

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Categoria
            </span>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Arquivo (PDF)
            </span>
            <button
              type="button"
              onClick={() => setArquivo('regulamento-estadual-2026.pdf')}
              className={
                'w-full rounded-lg border border-dashed px-4 py-6 flex flex-col items-center justify-center gap-2 transition-colors duration-150 ' +
                (arquivo
                  ? 'border-gold/50 bg-gold/5'
                  : 'border-federation/30 hover:border-federation/60 bg-[#0d1b2a]/40')
              }
            >
              {arquivo ? (
                <>
                  <FileText size={22} className="text-gold" />
                  <span className="font-body text-fht-white text-sm">
                    {arquivo}
                  </span>
                  <span className="font-body text-gray-soft text-xs">
                    Clique para trocar
                  </span>
                </>
              ) : (
                <>
                  <Upload size={22} className="text-gray-soft" />
                  <span className="font-body text-gray-soft text-sm">
                    Clique para selecionar o PDF
                  </span>
                  <span className="font-body text-gray-soft/60 text-xs">
                    até 10 MB
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Globe size={14} className="text-blue-300 shrink-0" />
            <p className="font-body text-gray-soft text-xs">
              Este documento ficará <span className="text-blue-300">público</span>{' '}
              no site após o envio.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-federation/20 flex gap-3 justify-end">
          <button className={secundarioBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={
              primarioBtn + (podeEnviar ? '' : ' opacity-40 cursor-not-allowed')
            }
            onClick={handleEnviar}
            disabled={!podeEnviar}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

type ViewerProps = {
  doc: Documento;
  onClose: () => void;
};

function ViewerModal({ doc, onClose }: ViewerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-federation/20 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-body text-gray-soft text-xs uppercase tracking-wider">
              Visualizando PDF
            </p>
            <h3 className="font-display text-fht-white text-lg tracking-wide truncate">
              {doc.titulo}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="text-gray-soft hover:text-gold border border-federation/30 hover:border-federation/60 rounded-lg p-2 transition-colors duration-150">
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-soft hover:text-fht-white transition-colors duration-150"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Corpo do viewer — página de PDF mock */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070D1E]">
          <div className="mx-auto max-w-md bg-fht-white rounded-md shadow-2xl aspect-[1/1.414] p-8 flex flex-col">
            <div className="border-b-2 border-federation pb-4 mb-6 text-center">
              <p className="font-display text-federation text-2xl tracking-wide">
                FHT
              </p>
              <p className="font-body text-[10px] text-night/60 tracking-widest uppercase mt-1">
                Federação de Handebol do Tocantins
              </p>
            </div>

            <h4 className="font-display text-night text-xl tracking-wide text-center mb-1">
              {doc.titulo}
            </h4>
            <p className="font-body text-night/50 text-[11px] text-center mb-6">
              Categoria: {doc.categoria} · Publicado em {doc.publicadoEm}
            </p>

            <div className="flex flex-col gap-2.5 flex-1">
              <div className="h-3 rounded bg-night/10 w-1/3" />
              <div className="h-2 rounded bg-night/10 w-full" />
              <div className="h-2 rounded bg-night/10 w-full" />
              <div className="h-2 rounded bg-night/10 w-11/12" />
              <div className="h-2 rounded bg-night/10 w-4/5" />
              <div className="h-3 rounded bg-night/10 w-2/5 mt-4" />
              <div className="h-2 rounded bg-night/10 w-full" />
              <div className="h-2 rounded bg-night/10 w-full" />
              <div className="h-2 rounded bg-night/10 w-10/12" />
              <div className="h-2 rounded bg-night/10 w-3/4" />
              <div className="h-2 rounded bg-night/10 w-full" />
            </div>

            <div className="border-t border-night/10 pt-3 mt-6 flex items-center justify-between">
              <span className="font-body text-[10px] text-night/40">
                Documento público — Transparência FHT
              </span>
              <span className="font-body text-[10px] text-night/40">
                Página 1 de {doc.paginas}
              </span>
            </div>
          </div>

          <p className="text-center mt-4">{demoSelo}</p>
        </div>

        <div className="p-4 border-t border-federation/20 flex items-center justify-between">
          <span className="font-body text-gray-soft text-xs">
            PDF · {doc.tamanho} · {doc.paginas} páginas
          </span>
          <button className={secundarioBtn} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
