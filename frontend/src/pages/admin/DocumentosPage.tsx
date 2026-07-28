import { useEffect, useState } from 'react';
import { FileText, Plus, X, Eye, Download, Trash2, Pencil, Globe, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { apiGet, apiPostJson, apiPut, apiDelete, apiPostForm, fileUrl } from '../../services/api';
import type { DocumentoDTO, DocumentoCategoria, DocumentoUploadResponse } from '../../types/api';

const CATEGORIAS: DocumentoCategoria[] = ['Estatuto', 'Regulamento', 'Calendário', 'Edital', 'Circular'];
const FILTROS: (DocumentoCategoria | 'Todos')[] = ['Todos', ...CATEGORIAS];

const badgeCategoria: Record<DocumentoCategoria, string> = {
  Estatuto: 'text-gold bg-gold/10 border-gold/30',
  Regulamento: 'text-blue-300 bg-blue-mid/10 border-blue-400/30',
  Calendário: 'text-green-400 bg-green-500/10 border-green-500/30',
  Edital: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Circular: 'text-gray-soft bg-gray-soft/10 border-gray-soft/30',
};

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1).replace('.', ',')} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
function formatData(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
}

const primarioBtn = 'font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250';
const secundarioBtn = 'font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250';

export function DocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<DocumentoCategoria | 'Todos'>('Todos');
  const [addAberto, setAddAberto] = useState(false);
  const [editando, setEditando] = useState<DocumentoDTO | null>(null);
  const [viewerDoc, setViewerDoc] = useState<DocumentoDTO | null>(null);

  async function carregar() {
    setCarregando(true); setErro('');
    try { setDocumentos(await apiGet<DocumentoDTO[]>('/api/documentos')); }
    catch { setErro('Não foi possível carregar os documentos.'); }
    finally { setCarregando(false); }
  }
  useEffect(() => { void carregar(); }, []);

  const visiveis = filtro === 'Todos' ? documentos : documentos.filter((d) => d.categoria === filtro);

  async function deletar(d: DocumentoDTO) {
    if (!window.confirm(`Deletar "${d.titulo}"?`)) return;
    try { await apiDelete(`/api/documentos/${d.id}`); setDocumentos((l) => l.filter((x) => x.id !== d.id)); }
    catch { setErro('Não foi possível deletar.'); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-fht-white text-3xl">DOCUMENTOS</h2>
        <button className={primarioBtn} onClick={() => setAddAberto(true)}>
          <span className="inline-flex items-center gap-2"><Plus size={16} /> Adicionar documento</span>
        </button>
      </div>

      {erro && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 mb-6 font-body text-sm"><AlertCircle size={16} /> {erro}</div>}

      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-mid/10 border border-blue-400/30 flex items-center justify-center shrink-0"><Globe size={18} className="text-blue-300" /></div>
        <div>
          <p className="font-body text-fht-white text-sm">Todos os documentos institucionais são <span className="text-blue-300">públicos</span> e ficam na aba de Transparência do site.</p>
          <p className="font-body text-gray-soft text-xs mt-1">Ao publicar, o arquivo passa a ser visível para qualquer visitante.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTROS.map((f) => {
          const ativo = f === filtro;
          const n = f === 'Todos' ? documentos.length : documentos.filter((d) => d.categoria === f).length;
          return (
            <button key={f} onClick={() => setFiltro(f)}
              className={'font-body text-xs px-3.5 py-1.5 rounded-full border transition-colors duration-150 ' + (ativo ? 'text-night bg-gold border-gold' : 'text-gray-soft bg-transparent border-federation/30 hover:border-federation/60')}>
              {f}<span className="ml-1.5 opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {carregando ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 flex items-center justify-center gap-3">
          <Loader2 size={22} className="text-gold animate-spin" /><span className="font-body text-gray-soft text-sm">Carregando...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visiveis.map((doc) => (
            <div key={doc.id} className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-federation/10 border border-federation/20 flex items-center justify-center shrink-0"><FileText size={22} className="text-gold" /></div>
              <div className="flex-1 min-w-[220px]">
                <p className="font-body text-fht-white text-sm font-medium">{doc.titulo}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="font-body text-gray-soft text-xs inline-flex items-center gap-1"><Calendar size={12} /> Publicado em {formatData(doc.dataPublicacao)}</span>
                  {doc.tamanhoBytes && (<><span className="text-gray-soft/40">·</span><span className="font-body text-gray-soft text-xs">PDF · {formatBytes(doc.tamanhoBytes)}</span></>)}
                </div>
              </div>
              <span className={'font-body text-xs px-2.5 py-1 rounded-full border ' + badgeCategoria[doc.categoria]}>{doc.categoria}</span>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setViewerDoc(doc)} title="Visualizar" className="font-body text-xs text-gray-soft hover:text-fht-white inline-flex items-center gap-1.5 border border-federation/30 hover:border-federation/60 rounded-lg px-3 py-2 transition-colors duration-150"><Eye size={15} /> Visualizar</button>
                <a href={fileUrl(doc.arquivoUrl)} target="_blank" rel="noopener noreferrer" title="Baixar" className="text-gray-soft hover:text-gold border border-federation/30 hover:border-federation/60 rounded-lg p-2 transition-colors duration-150"><Download size={15} /></a>
                <button onClick={() => setEditando(doc)} title="Editar" className="text-gray-soft hover:text-gold border border-federation/30 hover:border-gold/50 rounded-lg p-2 transition-colors duration-150"><Pencil size={15} /></button>
                <button onClick={() => void deletar(doc)} title="Deletar" className="text-gray-soft hover:text-red-400 border border-federation/30 hover:border-red-500/50 rounded-lg p-2 transition-colors duration-150"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {visiveis.length === 0 && (
            <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 text-center">
              <FileText size={28} className="text-gray-soft/50 mx-auto mb-3" />
              <p className="font-body text-gray-soft text-sm">{documentos.length === 0 ? 'Nenhum documento publicado ainda.' : 'Nenhum documento nesta categoria.'}</p>
            </div>
          )}
        </div>
      )}

      {(addAberto || editando) && (
        <DocumentoFormModal
          editando={editando}
          onClose={() => { setAddAberto(false); setEditando(null); }}
          onSalvo={(d, isEdit) => {
            setDocumentos((l) => (isEdit ? l.map((x) => (x.id === d.id ? d : x)) : [d, ...l]));
            setAddAberto(false); setEditando(null);
          }}
        />
      )}
      {viewerDoc && <ViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} />}
    </div>
  );
}

function DocumentoFormModal({ editando, onClose, onSalvo }: { editando: DocumentoDTO | null; onClose: () => void; onSalvo: (d: DocumentoDTO, isEdit: boolean) => void }) {
  const isEdit = editando !== null;
  const [titulo, setTitulo] = useState(editando?.titulo ?? '');
  const [categoria, setCategoria] = useState<DocumentoCategoria>(editando?.categoria ?? 'Regulamento');
  const [arquivoUrl, setArquivoUrl] = useState(editando?.arquivoUrl ?? '');
  const [arquivoNome, setArquivoNome] = useState(editando ? 'Arquivo atual — troque se quiser' : '');
  const [tamanhoBytes, setTamanhoBytes] = useState<number | null>(editando?.tamanhoBytes ?? null);
  const [enviando, setEnviando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // !enviando impede publicar com uma URL velha enquanto um arquivo de troca ainda sobe.
  const podeEnviar = titulo.trim().length > 0 && arquivoUrl.length > 0 && !enviando;

  async function enviarArquivo(file: File) {
    setErro(''); setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiPostForm<DocumentoUploadResponse>('/api/documentos/upload-arquivo', fd);
      setArquivoUrl(res.url); setArquivoNome(file.name); setTamanhoBytes(res.tamanhoBytes);
    } catch { setErro('Falha ao enviar o arquivo.'); }
    finally { setEnviando(false); }
  }

  async function salvar() {
    if (!podeEnviar) return;
    setSalvando(true); setErro('');
    const payload = { titulo: titulo.trim(), categoria, arquivoUrl, tamanhoBytes };
    try {
      const d = isEdit
        ? await apiPut<DocumentoDTO>(`/api/documentos/${editando!.id}`, payload)
        : await apiPostJson<DocumentoDTO>('/api/documentos', payload);
      onSalvo(d, isEdit);
    } catch { setErro('Não foi possível salvar o documento.'); setSalvando(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-federation/20 flex items-center justify-between">
          <h3 className="font-display text-fht-white text-xl tracking-wider">{isEdit ? 'EDITAR DOCUMENTO' : 'ADICIONAR DOCUMENTO'}</h3>
          <button onClick={onClose} className="text-gray-soft hover:text-fht-white transition-colors duration-150"><X size={20} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {erro && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-3 py-2 font-body text-xs"><AlertCircle size={14} /> {erro}</div>}
          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Título</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Regulamento Estadual 2026" className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full" />
          </label>
          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Categoria</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as DocumentoCategoria)} className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white text-sm outline-none w-full appearance-none cursor-pointer">
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <div>
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Arquivo (PDF)</span>
            <label className={'w-full rounded-lg border border-dashed px-4 py-6 flex flex-col items-center justify-center gap-2 transition-colors duration-150 cursor-pointer ' + (arquivoUrl ? 'border-gold/50 bg-gold/5' : 'border-federation/30 hover:border-federation/60 bg-[#0d1b2a]/40')}>
              {enviando ? <Loader2 size={22} className="text-gold animate-spin" /> : <FileText size={22} className={arquivoUrl ? 'text-gold' : 'text-gray-soft'} />}
              <span className="font-body text-fht-white text-sm">{enviando ? 'Enviando...' : arquivoNome || 'Clique para selecionar o PDF'}</span>
              <span className="font-body text-gray-soft/60 text-xs">{arquivoUrl ? 'Clique para trocar' : 'PDF até 10 MB'}</span>
              <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={enviando} onChange={(e) => { const f = e.target.files?.[0]; if (f) void enviarArquivo(f); }} />
            </label>
          </div>
          <div className="flex items-center gap-2"><Globe size={14} className="text-blue-300 shrink-0" /><p className="font-body text-gray-soft text-xs">Este documento ficará <span className="text-blue-300">público</span> no site após o envio.</p></div>
        </div>

        <div className="p-5 border-t border-federation/20 flex gap-3 justify-end">
          <button className={secundarioBtn} onClick={onClose}>Cancelar</button>
          <button className={primarioBtn + (podeEnviar && !salvando ? '' : ' opacity-40 cursor-not-allowed')} onClick={() => void salvar()} disabled={!podeEnviar || salvando}>
            <span className="inline-flex items-center gap-2">{salvando && <Loader2 size={16} className="animate-spin" />}{isEdit ? 'Salvar' : 'Publicar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewerModal({ doc, onClose }: { doc: DocumentoDTO; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-federation/20 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-body text-gray-soft text-xs uppercase tracking-wider">Visualizando PDF</p>
            <h3 className="font-display text-fht-white text-lg tracking-wide truncate">{doc.titulo}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={fileUrl(doc.arquivoUrl)} target="_blank" rel="noopener noreferrer" className="text-gray-soft hover:text-gold border border-federation/30 hover:border-federation/60 rounded-lg p-2 transition-colors duration-150"><Download size={16} /></a>
            <button onClick={onClose} className="text-gray-soft hover:text-fht-white transition-colors duration-150"><X size={20} /></button>
          </div>
        </div>
        <div className="flex-1 bg-[#070D1E] p-2">
          <iframe src={fileUrl(doc.arquivoUrl)} title={doc.titulo} className="w-full h-[70vh] rounded-md bg-white" />
        </div>
      </div>
    </div>
  );
}
