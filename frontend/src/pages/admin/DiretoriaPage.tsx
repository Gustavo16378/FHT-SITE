import { useEffect, useState } from 'react';
import { Plus, X, Pencil, Trash2, Upload, UserCog, Loader2, AlertCircle } from 'lucide-react';
import { apiGet, apiPostJson, apiPut, apiDelete, apiPostForm, fileUrl } from '../../services/api';
import type { DiretorDTO, UploadResponse } from '../../types/api';

const AREAS = ['Gestão Geral', 'Competições', 'Financeiro', 'Arbitragem', 'Comunicação', 'Outra'];

function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}

interface FormDiretor {
  nome: string;
  cargo: string;
  area: string;
  mandato: string;
  email: string;
  telefone: string;
  desde: string;
  bio: string;
  fotoUrl: string;
  ordem: string;
}

function vazio(): FormDiretor {
  return { nome: '', cargo: '', area: 'Gestão Geral', mandato: '', email: '', telefone: '', desde: '', bio: '', fotoUrl: '', ordem: '0' };
}

function deDTO(d: DiretorDTO): FormDiretor {
  return {
    nome: d.nome, cargo: d.cargo, area: d.area ?? 'Gestão Geral', mandato: d.mandato ?? '',
    email: d.email ?? '', telefone: d.telefone ?? '', desde: d.desde ?? '', bio: d.bio ?? '',
    fotoUrl: d.fotoUrl ?? '', ordem: String(d.ordem ?? 0),
  };
}

function FormModal({ editando, salvando, onClose, onSalvar }: {
  editando: DiretorDTO | null;
  salvando: boolean;
  onClose: () => void;
  onSalvar: (dados: FormDiretor, id: string | null) => void;
}) {
  const [form, setForm] = useState<FormDiretor>(editando ? deDTO(editando) : vazio());
  const [enviando, setEnviando] = useState(false);
  const set = <K extends keyof FormDiretor>(k: K, v: FormDiretor[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function enviarFoto(file: File) {
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiPostForm<UploadResponse>('/api/diretores/upload-foto', fd);
      set('fotoUrl', res.url);
    } catch { /* silencioso: admin pode colar URL */ }
    finally { setEnviando(false); }
  }

  const campo = 'font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full';
  const rotulo = 'font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-federation/20 flex items-center justify-between sticky top-0 bg-[#0a1628] z-10">
          <h3 className="font-display text-fht-white text-xl tracking-wider">{editando ? 'EDITAR MEMBRO' : 'ADICIONAR MEMBRO'}</h3>
          <button type="button" onClick={onClose} className="text-gray-soft hover:text-fht-white transition-colors duration-150"><X size={20} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* foto */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-federation/20 border border-federation/40 flex items-center justify-center overflow-hidden shrink-0">
              {form.fotoUrl
                ? <img src={fileUrl(form.fotoUrl)} alt="Foto" className="w-full h-full object-cover" />
                : <span className="font-display text-gold text-2xl">{form.nome ? iniciais(form.nome) : '?'}</span>}
            </div>
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 font-body text-sm text-gray-soft hover:text-gold border border-federation/30 hover:border-gold/40 rounded-lg px-3 py-2 cursor-pointer transition-colors duration-150">
                {enviando ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {enviando ? 'Enviando...' : 'Enviar foto'}
                <input type="file" accept="image/*" className="hidden" disabled={enviando} onChange={(e) => { const f = e.target.files?.[0]; if (f) void enviarFoto(f); }} />
              </label>
              {form.fotoUrl && <button type="button" onClick={() => set('fotoUrl', '')} className="ml-2 font-body text-xs text-gray-soft hover:text-red-400">remover</button>}
            </div>
          </div>

          <label className="block"><span className={rotulo}>Nome completo</span>
            <input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: Maria Fernanda Souza" className={campo} /></label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className={rotulo}>Cargo</span>
              <input value={form.cargo} onChange={(e) => set('cargo', e.target.value)} placeholder="Ex.: Presidente" className={campo} /></label>
            <label className="block"><span className={rotulo}>Área</span>
              <select value={form.area} onChange={(e) => set('area', e.target.value)} className={`${campo} appearance-none cursor-pointer`}>
                {AREAS.map((a) => <option key={a} value={a} className="bg-[#0a1628]">{a}</option>)}
              </select></label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className={rotulo}>Mandato</span>
              <input value={form.mandato} onChange={(e) => set('mandato', e.target.value)} placeholder="2023–2027" className={campo} /></label>
            <label className="block"><span className={rotulo}>Na diretoria desde</span>
              <input value={form.desde} onChange={(e) => set('desde', e.target.value)} placeholder="Fevereiro/2023" className={campo} /></label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className={rotulo}>E-mail institucional</span>
              <input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="nome@fht.org.br" className={campo} /></label>
            <label className="block"><span className={rotulo}>Telefone</span>
              <input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} placeholder="(63) 9....." className={campo} /></label>
          </div>

          <label className="block"><span className={rotulo}>Ordem de exibição</span>
            <input type="number" value={form.ordem} onChange={(e) => set('ordem', e.target.value)} className={`${campo} w-28`} /></label>

          <label className="block"><span className={rotulo}>Bio / currículo <span className="normal-case text-gray-soft/60">(parágrafos separados por linha em branco)</span></span>
            <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={6} placeholder="Trajetória, formação, tempo de trabalho..." className={`${campo} resize-y leading-relaxed`} /></label>
        </div>

        <div className="p-5 border-t border-federation/20 flex gap-3 justify-end sticky bottom-0 bg-[#0a1628]">
          <button type="button" onClick={onClose} className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250">CANCELAR</button>
          <button type="button" disabled={salvando || enviando} onClick={() => onSalvar(form, editando?.id ?? null)}
            className="font-display text-night bg-gold hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2">
            {salvando && <Loader2 size={16} className="animate-spin" />}{editando ? 'SALVAR' : 'ADICIONAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DiretoriaPage() {
  const [diretores, setDiretores] = useState<DiretorDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<DiretorDTO | null>(null);

  async function carregar() {
    setCarregando(true); setErro('');
    try { setDiretores(await apiGet<DiretorDTO[]>('/api/diretores')); }
    catch { setErro('Não foi possível carregar a diretoria.'); }
    finally { setCarregando(false); }
  }
  useEffect(() => { void carregar(); }, []);

  async function deletar(d: DiretorDTO) {
    if (!window.confirm(`Remover ${d.nome} da diretoria?`)) return;
    try { await apiDelete(`/api/diretores/${d.id}`); setDiretores((l) => l.filter((x) => x.id !== d.id)); }
    catch { setErro('Não foi possível remover.'); }
  }

  async function salvar(dados: FormDiretor, id: string | null) {
    if (!dados.nome.trim() || !dados.cargo.trim()) { setErro('Nome e cargo são obrigatórios.'); return; }
    setSalvando(true); setErro('');
    const payload = {
      nome: dados.nome.trim(), cargo: dados.cargo.trim(), area: dados.area || null,
      mandato: dados.mandato || null, email: dados.email || null, telefone: dados.telefone || null,
      desde: dados.desde || null, bio: dados.bio || null, fotoUrl: dados.fotoUrl || null,
      ordem: Number(dados.ordem) || 0,
    };
    try {
      if (id === null) { const novo = await apiPostJson<DiretorDTO>('/api/diretores', payload); setDiretores((l) => [...l, novo]); }
      else { const upd = await apiPut<DiretorDTO>(`/api/diretores/${id}`, payload); setDiretores((l) => l.map((x) => (x.id === id ? upd : x))); }
      setModalAberto(false); setEditando(null);
    } catch { setErro('Não foi possível salvar.'); }
    finally { setSalvando(false); }
  }

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="font-display text-fht-white text-3xl">DIRETORIA</h2>
          <p className="font-body text-gray-soft text-sm mt-1">Membros da diretoria — perfis exibidos no site institucional.</p>
        </div>
        <button type="button" onClick={() => { setEditando(null); setModalAberto(true); }}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2">
          <Plus size={16} /> Adicionar membro
        </button>
      </div>

      {erro && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 mb-6 font-body text-sm"><AlertCircle size={16} /> {erro}</div>}

      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-4 mb-6 flex items-center gap-3">
        <UserCog size={18} className="text-gold shrink-0" />
        <p className="font-body text-gray-soft text-sm">Adicione, edite (foto, bio, contato) e ordene os membros. Clique num card para editar.</p>
      </div>

      {carregando ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 flex items-center justify-center gap-3">
          <Loader2 size={22} className="text-gold animate-spin" /><span className="font-body text-gray-soft text-sm">Carregando...</span>
        </div>
      ) : diretores.length === 0 ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 text-center">
          <UserCog size={30} className="text-gray-soft/50 mx-auto mb-3" />
          <p className="font-body text-gray-soft text-sm">Nenhum membro ainda. Adicione o primeiro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {diretores.map((d) => (
            <div key={d.id} className="bg-[#0d1b2a]/60 border border-federation/20 hover:border-gold/40 rounded-xl p-5 flex flex-col items-center text-center transition-colors duration-250 group relative">
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => { setEditando(d); setModalAberto(true); }} title="Editar" className="p-1.5 rounded bg-night/70 border border-federation/30 text-fht-white hover:text-gold hover:border-gold/40"><Pencil size={13} /></button>
                <button type="button" onClick={() => void deletar(d)} title="Remover" className="p-1.5 rounded bg-night/70 border border-red-500/30 text-red-400 hover:bg-red-500/20"><Trash2 size={13} /></button>
              </div>
              <button type="button" onClick={() => { setEditando(d); setModalAberto(true); }} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-lg bg-federation/20 border border-federation/40 group-hover:border-gold/50 flex items-center justify-center mb-4 overflow-hidden transition-colors duration-250">
                  {d.fotoUrl ? <img src={fileUrl(d.fotoUrl)} alt={d.nome} className="w-full h-full object-cover" /> : <span className="font-display text-gold text-3xl tracking-wider">{iniciais(d.nome)}</span>}
                </div>
                <p className="font-body text-fht-white text-sm font-semibold leading-tight">{d.nome}</p>
                <p className="font-body text-gray-soft text-xs mt-1">{d.cargo}</p>
              </button>
            </div>
          ))}
        </div>
      )}

      {modalAberto && <FormModal editando={editando} salvando={salvando} onClose={() => { setModalAberto(false); setEditando(null); }} onSalvar={(dados, id) => void salvar(dados, id)} />}
    </div>
  );
}
