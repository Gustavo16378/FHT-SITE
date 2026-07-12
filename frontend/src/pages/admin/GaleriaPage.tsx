import { useState } from 'react';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Image,
  Upload,
  Filter,
  Calendar,
  Award,
  type LucideIcon,
} from 'lucide-react';

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------
type Photo = {
  id: number;
  evento: string;
  ano: string;
  categoria: string;
  gradient: string;
  span: string;
  naHome: boolean;
};

type ModalMode = 'add' | 'edit' | null;

// ----------------------------------------------------------------------------
// Mock — gradientes (strings literais p/ o Tailwind reconhecer as classes)
// ----------------------------------------------------------------------------
const GRADIENTS: string[] = [
  'from-blue-900 via-federation to-night',
  'from-federation via-blue-mid to-night',
  'from-indigo-900 via-blue-mid to-night',
  'from-slate-800 via-federation to-blue-950',
  'from-yellow-900 via-federation to-night',
  'from-blue-950 via-blue-mid to-federation',
  'from-cyan-900 via-federation to-night',
  'from-amber-900 via-federation to-night',
];

const ANOS: string[] = ['2025', '2024', '2023', '2022'];

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

const INITIAL_PHOTOS: Photo[] = [
  { id: 1, evento: 'Campeonato Estadual', ano: '2024', categoria: 'Adulto Masculino', gradient: GRADIENTS[0], span: 'col-span-2 row-span-2', naHome: true },
  { id: 2, evento: 'Copa FHT Sub-18', ano: '2024', categoria: 'Sub-18 Feminino', gradient: GRADIENTS[4], span: '', naHome: true },
  { id: 3, evento: 'Festival Sub-14', ano: '2023', categoria: 'Sub-14', gradient: GRADIENTS[2], span: '', naHome: false },
  { id: 4, evento: 'Circuito Interior', ano: '2023', categoria: 'Adulto Feminino', gradient: GRADIENTS[3], span: 'row-span-2', naHome: true },
  { id: 5, evento: 'Jogos do Interior', ano: '2022', categoria: 'Seleção TO', gradient: GRADIENTS[1], span: 'col-span-2', naHome: false },
  { id: 6, evento: 'Abertura da Temporada', ano: '2024', categoria: 'Sub-16', gradient: GRADIENTS[6], span: '', naHome: false },
  { id: 7, evento: 'Final da Taça FHT', ano: '2023', categoria: 'Adulto Masculino', gradient: GRADIENTS[5], span: '', naHome: true },
  { id: 8, evento: 'Peneira Estadual', ano: '2022', categoria: 'Sub-14', gradient: GRADIENTS[7], span: '', naHome: false },
];

// ----------------------------------------------------------------------------
// Selo de demonstração
// ----------------------------------------------------------------------------
function DemoSeal() {
  return (
    <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
      demonstração
    </span>
  );
}

// ----------------------------------------------------------------------------
// Card de estatística
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Bloco de foto (mosaico)
// ----------------------------------------------------------------------------
function PhotoTile({ photo, onEdit, onDelete }: { photo: Photo; onEdit: (p: Photo) => void; onDelete: (id: number) => void }) {
  return (
    <div className={`relative rounded-xl overflow-hidden group bg-gradient-to-br ${photo.gradient} ${photo.span}`}>
      {/* textura sutil */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,rgba(245,197,24,0.35),transparent_60%)] pointer-events-none" />
      {/* escurece no hover */}
      <div className="absolute inset-0 bg-night/0 group-hover:bg-night/25 transition-colors duration-200 pointer-events-none" />

      {/* pill "na vitrine" */}
      {photo.naHome && (
        <span className="absolute top-2 left-2 font-body text-[10px] px-2 py-0.5 rounded-full border text-green-400 bg-night/60 border-green-500/40">
          na vitrine
        </span>
      )}

      {/* ações no hover */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={() => onEdit(photo)}
          title="Editar legenda"
          className="p-2 rounded-lg bg-night/70 border border-federation/30 text-fht-white hover:text-gold hover:border-gold/40 transition-colors duration-150"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(photo.id)}
          title="Deletar foto"
          className="p-2 rounded-lg bg-night/70 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors duration-150"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* legenda sempre visível */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-10">
        <p className="font-body text-fht-white text-sm font-semibold leading-tight">
          {photo.evento} <span className="text-gold">{photo.ano}</span>
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="w-1 h-1 rounded-full bg-gold/70" />
          <span className="font-body text-[11px] text-gray-soft">{photo.categoria}</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Modal de formulário (adicionar / editar)
// ----------------------------------------------------------------------------
type PhotoFormModalProps = {
  mode: 'add' | 'edit';
  evento: string;
  setEvento: (v: string) => void;
  ano: string;
  setAno: (v: string) => void;
  categoria: string;
  setCategoria: (v: string) => void;
  arquivo: string | null;
  setArquivo: (v: string | null) => void;
  onClose: () => void;
  onSubmit: () => void;
};

function PhotoFormModal({
  mode,
  evento,
  setEvento,
  ano,
  setAno,
  categoria,
  setCategoria,
  arquivo,
  setArquivo,
  onClose,
  onSubmit,
}: PhotoFormModalProps) {
  const isAdd = mode === 'add';
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
        {/* header */}
        <div className="p-5 border-b border-federation/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAdd ? <Plus className="w-5 h-5 text-gold" /> : <Pencil className="w-5 h-5 text-gold" />}
            <h3 className="font-display text-fht-white text-xl tracking-wider">
              {isAdd ? 'ADICIONAR FOTO' : 'EDITAR LEGENDA'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-soft hover:text-fht-white transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* corpo */}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Legenda / Evento
            </span>
            <input
              value={evento}
              onChange={(e) => setEvento(e.target.value)}
              placeholder="Ex.: Campeonato Estadual"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Ano</span>
              <select
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
              >
                {ANOS.map((a) => (
                  <option key={a} value={a} className="bg-[#0a1628]">
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Categoria</span>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c} className="bg-[#0a1628]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Arquivo</span>
            {arquivo ? (
              <div className="flex items-center gap-3 bg-[#0d1b2a]/80 border border-green-500/30 rounded-lg px-4 py-3">
                <Image className="w-5 h-5 text-green-400 shrink-0" />
                <span className="font-body text-fht-white text-sm flex-1 truncate">{arquivo}</span>
                <button
                  type="button"
                  onClick={() => setArquivo(null)}
                  className="text-gray-soft hover:text-fht-white transition-colors duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setArquivo('foto_evento.jpg')}
                className="w-full border-2 border-dashed border-federation/30 hover:border-gold/40 rounded-lg py-8 flex flex-col items-center gap-2 transition-colors duration-200"
              >
                <Upload className="w-6 h-6 text-gold" />
                <span className="font-body text-gray-soft text-sm">Clique para selecionar uma imagem</span>
                <span className="font-body text-gray-soft/60 text-xs">JPG ou PNG · até 5 MB</span>
              </button>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-federation/20 flex gap-3 justify-end items-center">
          <span className="mr-auto">
            <DemoSeal />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
          >
            {isAdd ? 'ADICIONAR' : 'SALVAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Tela principal
// ----------------------------------------------------------------------------
export function GaleriaPage() {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);

  // filtros
  const [filtroAno, setFiltroAno] = useState<string>('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');

  // modal / form
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formEvento, setFormEvento] = useState<string>('');
  const [formAno, setFormAno] = useState<string>('2024');
  const [formCategoria, setFormCategoria] = useState<string>('Adulto Masculino');
  const [formArquivo, setFormArquivo] = useState<string | null>(null);

  const anosDisponiveis = Array.from(new Set(photos.map((p) => p.ano))).sort((a, b) => b.localeCompare(a));
  const categoriasDisponiveis = Array.from(new Set(photos.map((p) => p.categoria)));

  const fotosFiltradas = photos.filter(
    (p) =>
      (filtroAno === 'Todos' || p.ano === filtroAno) &&
      (filtroCategoria === 'Todos' || p.categoria === filtroCategoria)
  );

  const totalNaHome = photos.filter((p) => p.naHome).length;

  function openAdd() {
    setEditingId(null);
    setFormEvento('');
    setFormAno('2024');
    setFormCategoria('Adulto Masculino');
    setFormArquivo(null);
    setModalMode('add');
  }

  function openEdit(p: Photo) {
    setEditingId(p.id);
    setFormEvento(p.evento);
    setFormAno(p.ano);
    setFormCategoria(p.categoria);
    setFormArquivo('foto_evento.jpg');
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
  }

  function handleSubmit() {
    if (modalMode === 'add') {
      const nextId = photos.length ? Math.max(...photos.map((p) => p.id)) + 1 : 1;
      const gradient = GRADIENTS[photos.length % GRADIENTS.length];
      const nova: Photo = {
        id: nextId,
        evento: formEvento.trim() || 'Novo evento',
        ano: formAno,
        categoria: formCategoria,
        gradient,
        span: '',
        naHome: false,
      };
      setPhotos((prev) => [nova, ...prev]);
    } else if (modalMode === 'edit' && editingId !== null) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, evento: formEvento.trim() || p.evento, ano: formAno, categoria: formCategoria }
            : p
        )
      );
    }
    closeModal();
  }

  function handleDelete(id: number) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-fht-white text-3xl">GALERIA</h2>
          <DemoSeal />
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADICIONAR FOTO
        </button>
      </div>

      <p className="font-body text-gray-soft text-sm -mt-3 mb-6">
        Momentos que ficam — vitrine de fotos exibida no site público, curada pela federação.
      </p>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Image} label="Fotos na galeria" value={photos.length} />
        <StatCard icon={Award} label="Na vitrine da home" value={totalNaHome} />
        <StatCard icon={Calendar} label="Anos cobertos" value={anosDisponiveis.length} />
        <StatCard icon={Filter} label="Categorias" value={categoriasDisponiveis.length} />
      </div>

      {/* Barra de filtros */}
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-gold mr-2">
            <Filter className="w-4 h-4" />
            <p className="font-display text-gold text-xs tracking-widest">FILTRAR</p>
          </div>

          <div className="w-full sm:w-44">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Ano</span>
            <select
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
            >
              <option value="Todos" className="bg-[#0a1628]">
                Todos
              </option>
              {anosDisponiveis.map((a) => (
                <option key={a} value={a} className="bg-[#0a1628]">
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-56">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">Categoria</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
            >
              <option value="Todos" className="bg-[#0a1628]">
                Todas
              </option>
              {categoriasDisponiveis.map((c) => (
                <option key={c} value={c} className="bg-[#0a1628]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {(filtroAno !== 'Todos' || filtroCategoria !== 'Todos') && (
              <button
                type="button"
                onClick={() => {
                  setFiltroAno('Todos');
                  setFiltroCategoria('Todos');
                }}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-4 py-2 rounded-lg text-xs tracking-wider transition-colors duration-250"
              >
                LIMPAR
              </button>
            )}
            <span className="font-body text-gray-soft text-sm">
              {fotosFiltradas.length} {fotosFiltradas.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>
        </div>
      </div>

      {/* Mosaico */}
      {fotosFiltradas.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[170px] gap-4 grid-flow-row-dense">
          {fotosFiltradas.map((photo) => (
            <PhotoTile key={photo.id} photo={photo} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <Image className="w-10 h-10 text-gray-soft/50" />
          <p className="font-display text-fht-white text-lg tracking-wider">NENHUMA FOTO ENCONTRADA</p>
          <p className="font-body text-gray-soft text-sm">Ajuste os filtros ou adicione uma nova foto à galeria.</p>
        </div>
      )}

      {/* Modal */}
      {modalMode !== null && (
        <PhotoFormModal
          mode={modalMode}
          evento={formEvento}
          setEvento={setFormEvento}
          ano={formAno}
          setAno={setFormAno}
          categoria={formCategoria}
          setCategoria={setFormCategoria}
          arquivo={formArquivo}
          setArquivo={setFormArquivo}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
