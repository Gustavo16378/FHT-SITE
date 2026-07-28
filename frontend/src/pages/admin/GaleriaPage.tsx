import { useEffect, useState } from 'react';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  Filter,
  Calendar,
  Star,
  Loader2,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { apiGet, apiPostJson, apiPut, apiDelete, apiPostForm, fileUrl } from '../../services/api';
import type { FotoDTO, GaleriaTamanho, UploadResponse } from '../../types/api';

const ANOS: string[] = ['2026', '2025', '2024', '2023', '2022'];

const CATEGORIAS: string[] = [
  'Adulto Masculino',
  'Adulto Feminino',
  'Sub-18 Masculino',
  'Sub-18 Feminino',
  'Sub-16',
  'Sub-14',
  'Sub-12',
  'Seleção TO',
];

const TAMANHOS: { valor: GaleriaTamanho; rotulo: string }[] = [
  { valor: 'large', rotulo: 'Grande (destaque)' },
  { valor: 'medium', rotulo: 'Média' },
  { valor: 'small', rotulo: 'Pequena' },
];

const SPAN_POR_TAMANHO: Record<GaleriaTamanho, string> = {
  large: 'col-span-2 row-span-2',
  medium: '',
  small: '',
};

// ----------------------------- Stat card -----------------------------
function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-federation/15 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-gold" />
      </div>
      <div>
        <p className="font-display text-fht-white text-2xl leading-none">{value}</p>
        <p className="font-body text-gray-soft text-xs uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}

// ----------------------------- Tile -----------------------------
function PhotoTile({ foto, onEdit, onDelete }: { foto: FotoDTO; onEdit: (f: FotoDTO) => void; onDelete: (f: FotoDTO) => void }) {
  return (
    <div className={`relative rounded-xl overflow-hidden group ${SPAN_POR_TAMANHO[foto.tamanho]}`}>
      <img src={fileUrl(foto.imagemUrl)} alt={foto.evento} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-night/0 group-hover:bg-night/25 transition-colors duration-200 pointer-events-none" />

      {foto.tamanho === 'large' && (
        <span className="absolute top-2 left-2 font-body text-[10px] px-2 py-0.5 rounded-full border text-gold bg-night/60 border-gold/40 flex items-center gap-1">
          <Star className="w-3 h-3" /> destaque
        </span>
      )}

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button type="button" onClick={() => onEdit(foto)} title="Editar"
          className="p-2 rounded-lg bg-night/70 border border-federation/30 text-fht-white hover:text-gold hover:border-gold/40 transition-colors duration-150">
          <Pencil className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onDelete(foto)} title="Deletar"
          className="p-2 rounded-lg bg-night/70 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors duration-150">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-10">
        <p className="font-body text-fht-white text-sm font-semibold leading-tight">
          {foto.evento} {foto.ano && <span className="text-gold">{foto.ano}</span>}
        </p>
        {foto.categoria && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-1 h-1 rounded-full bg-gold/70" />
            <span className="font-body text-[11px] text-gray-soft">{foto.categoria}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------- Form modal -----------------------------
interface FormFoto {
  imagemUrl: string;
  evento: string;
  ano: string;
  categoria: string;
  tamanho: GaleriaTamanho;
}

function FotoFormModal({ editando, salvando, onClose, onSubmit }: {
  editando: FotoDTO | null;
  salvando: boolean;
  onClose: () => void;
  onSubmit: (dados: FormFoto, id: string | null) => void;
}) {
  const [form, setForm] = useState<FormFoto>({
    imagemUrl: editando?.imagemUrl ?? '',
    evento: editando?.evento ?? '',
    ano: editando?.ano ?? ANOS[0],
    categoria: editando?.categoria ?? CATEGORIAS[0],
    tamanho: editando?.tamanho ?? 'medium',
  });
  const [enviando, setEnviando] = useState(false);
  const [erroImg, setErroImg] = useState('');

  const set = <K extends keyof FormFoto>(k: K, v: FormFoto[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function enviarImagem(file: File) {
    setErroImg('');
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiPostForm<UploadResponse>('/api/galeria/upload-imagem', fd);
      set('imagemUrl', res.url);
    } catch {
      setErroImg('Falha ao enviar a imagem.');
    } finally {
      setEnviando(false);
    }
  }

  const isAdd = editando === null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-federation/20 flex items-center justify-between sticky top-0 bg-[#0a1628] z-10">
          <div className="flex items-center gap-2">
            {isAdd ? <Plus className="w-5 h-5 text-gold" /> : <Pencil className="w-5 h-5 text-gold" />}
            <h3 className="font-display text-fht-white text-xl tracking-wider">{isAdd ? 'ADICIONAR FOTO' : 'EDITAR FOTO'}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-soft hover:text-fht-white transition-colors duration-150">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* imagem */}
          <div>
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Imagem</span>
            {form.imagemUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-federation/20">
                <img src={fileUrl(form.imagemUrl)} alt="Foto" className="w-full h-48 object-cover" />
                <button type="button" onClick={() => set('imagemUrl', '')} aria-label="Remover"
                  className="absolute top-2 right-2 bg-night/80 hover:bg-night text-fht-white rounded-full p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full border-2 border-dashed border-federation/30 hover:border-gold/40 rounded-lg py-8 flex flex-col items-center gap-2 transition-colors duration-200 cursor-pointer">
                {enviando ? <Loader2 className="w-6 h-6 text-gold animate-spin" /> : <Upload className="w-6 h-6 text-gold" />}
                <span className="font-body text-gray-soft text-sm">{enviando ? 'Enviando...' : 'Clique para selecionar uma imagem'}</span>
                <span className="font-body text-gray-soft/60 text-xs">JPG ou PNG · até 5 MB</span>
                <input type="file" accept="image/*" className="hidden" disabled={enviando}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void enviarImagem(f); }} />
              </label>
            )}
            <input value={form.imagemUrl} onChange={(e) => set('imagemUrl', e.target.value)} placeholder="...ou cole a URL de uma imagem"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-2.5 text-fht-white placeholder-gray-soft text-xs outline-none w-full mt-2" />
            {erroImg && <p className="font-body text-red-400 text-xs mt-1">{erroImg}</p>}
          </div>

          {/* evento */}
          <div>
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Legenda / Evento</span>
            <input value={form.evento} onChange={(e) => set('evento', e.target.value)} placeholder="Ex.: Campeonato Estadual"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Ano</span>
              <select value={form.ano} onChange={(e) => set('ano', e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white text-sm outline-none w-full appearance-none cursor-pointer">
                {ANOS.map((a) => <option key={a} value={a} className="bg-[#0a1628]">{a}</option>)}
              </select>
            </div>
            <div>
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Categoria</span>
              <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white text-sm outline-none w-full appearance-none cursor-pointer">
                {CATEGORIAS.map((c) => <option key={c} value={c} className="bg-[#0a1628]">{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Tamanho no mosaico</span>
            <div className="inline-flex rounded-lg border border-federation/20 overflow-hidden">
              {TAMANHOS.map((t) => {
                const ativo = form.tamanho === t.valor;
                return (
                  <button key={t.valor} type="button" onClick={() => set('tamanho', t.valor)}
                    className={`font-body text-xs px-4 py-2.5 transition-colors duration-150 ${ativo ? 'bg-gold/20 text-gold' : 'text-gray-soft hover:text-fht-white'}`}>
                    {t.rotulo}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-federation/20 flex gap-3 justify-end sticky bottom-0 bg-[#0a1628]">
          <button type="button" onClick={onClose}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">
            CANCELAR
          </button>
          <button type="button" disabled={salvando || enviando} onClick={() => onSubmit(form, editando?.id ?? null)}
            className="font-display text-night bg-gold hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2">
            {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAdd ? 'ADICIONAR' : 'SALVAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------- Página -----------------------------
export function GaleriaPage() {
  const [fotos, setFotos] = useState<FotoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [filtroAno, setFiltroAno] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<FotoDTO | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setFotos(await apiGet<FotoDTO[]>('/api/galeria'));
    } catch {
      setErro('Não foi possível carregar a galeria.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { void carregar(); }, []);

  const anosDisponiveis = Array.from(new Set(fotos.map((p) => p.ano).filter(Boolean) as string[])).sort((a, b) => b.localeCompare(a));
  const categoriasDisponiveis = Array.from(new Set(fotos.map((p) => p.categoria).filter(Boolean) as string[]));

  const fotosFiltradas = fotos.filter(
    (p) => (filtroAno === 'Todos' || p.ano === filtroAno) && (filtroCategoria === 'Todos' || p.categoria === filtroCategoria),
  );
  const totalDestaques = fotos.filter((p) => p.tamanho === 'large').length;

  function abrirAdd() { setEditando(null); setModalAberto(true); }
  function abrirEdit(f: FotoDTO) { setEditando(f); setModalAberto(true); }
  function fechar() { setModalAberto(false); setEditando(null); }

  async function deletar(f: FotoDTO) {
    if (!window.confirm(`Deletar a foto "${f.evento}"?`)) return;
    try {
      await apiDelete(`/api/galeria/${f.id}`);
      setFotos((lista) => lista.filter((x) => x.id !== f.id));
    } catch {
      setErro('Não foi possível deletar a foto.');
    }
  }

  async function salvar(dados: FormFoto, id: string | null) {
    if (!dados.imagemUrl.trim()) { setErro('Selecione ou cole uma imagem.'); return; }
    setSalvando(true);
    setErro('');
    const payload = {
      imagemUrl: dados.imagemUrl.trim(),
      evento: dados.evento.trim(),
      ano: dados.ano,
      categoria: dados.categoria,
      tamanho: dados.tamanho,
    };
    try {
      if (id === null) {
        const nova = await apiPostJson<FotoDTO>('/api/galeria', payload);
        setFotos((lista) => [nova, ...lista]);
      } else {
        const atualizada = await apiPut<FotoDTO>(`/api/galeria/${id}`, payload);
        setFotos((lista) => lista.map((x) => (x.id === id ? atualizada : x)));
      }
      fechar();
    } catch {
      setErro('Não foi possível salvar. Confira a imagem e a legenda.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-fht-white text-3xl">GALERIA</h2>
        <button type="button" onClick={abrirAdd}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2">
          <Plus className="w-4 h-4" /> ADICIONAR FOTO
        </button>
      </div>

      <p className="font-body text-gray-soft text-sm -mt-3 mb-6">
        Momentos que ficam — vitrine de fotos exibida no site público, curada pela federação.
      </p>

      {erro && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 mb-6 font-body text-sm">
          <AlertCircle size={16} /> {erro}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={ImageIcon} label="Fotos na galeria" value={fotos.length} />
        <StatCard icon={Star} label="Em destaque" value={totalDestaques} />
        <StatCard icon={Calendar} label="Anos cobertos" value={anosDisponiveis.length} />
      </div>

      {/* filtros */}
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-gold mr-2">
            <Filter className="w-4 h-4" />
            <p className="font-display text-gold text-xs tracking-widest">FILTRAR</p>
          </div>
          <div className="w-full sm:w-44">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Ano</span>
            <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)}
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white text-sm outline-none w-full appearance-none cursor-pointer">
              <option value="Todos" className="bg-[#0a1628]">Todos</option>
              {anosDisponiveis.map((a) => <option key={a} value={a} className="bg-[#0a1628]">{a}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-56">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Categoria</span>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white text-sm outline-none w-full appearance-none cursor-pointer">
              <option value="Todos" className="bg-[#0a1628]">Todas</option>
              {categoriasDisponiveis.map((c) => <option key={c} value={c} className="bg-[#0a1628]">{c}</option>)}
            </select>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {(filtroAno !== 'Todos' || filtroCategoria !== 'Todos') && (
              <button type="button" onClick={() => { setFiltroAno('Todos'); setFiltroCategoria('Todos'); }}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-4 py-2 rounded-lg text-xs tracking-wider transition-colors duration-250">
                LIMPAR
              </button>
            )}
            <span className="font-body text-gray-soft text-sm">
              {fotosFiltradas.length} {fotosFiltradas.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>
        </div>
      </div>

      {/* mosaico */}
      {carregando ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 flex items-center justify-center gap-3">
          <Loader2 size={22} className="text-gold animate-spin" />
          <span className="font-body text-gray-soft text-sm">Carregando galeria...</span>
        </div>
      ) : fotosFiltradas.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[170px] gap-4 grid-flow-row-dense">
          {fotosFiltradas.map((foto) => (
            <PhotoTile key={foto.id} foto={foto} onEdit={abrirEdit} onDelete={(f) => void deletar(f)} />
          ))}
        </div>
      ) : (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <ImageIcon className="w-10 h-10 text-gray-soft/50" />
          <p className="font-display text-fht-white text-lg tracking-wider">NENHUMA FOTO</p>
          <p className="font-body text-gray-soft text-sm">
            {fotos.length === 0 ? 'Adicione a primeira foto à galeria.' : 'Ajuste os filtros ou adicione uma nova foto.'}
          </p>
        </div>
      )}

      {modalAberto && (
        <FotoFormModal editando={editando} salvando={salvando} onClose={fechar} onSubmit={(dados, id) => void salvar(dados, id)} />
      )}
    </div>
  );
}
