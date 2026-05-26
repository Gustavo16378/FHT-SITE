import { useState, useRef } from 'react'
import { X, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { maskCPF, maskPhone, validateCPF } from '../utils/masks'
import { UFS } from '../utils/ufs'

const CURSOS = ['Formação Regional', 'Atualização Estadual']
const NIVEIS = ['Regional', 'Estadual B', 'Estadual A', 'Nacional']

const blank = {
  nomeCompleto: '', dataNascimento: '', sexo: '', cpf: '', rg: '', orgaoEmissor: '',
  telefone: '', email: '', cidade: '', uf: 'TO',
  jaArbitro: false, nivelAtual: '', federacaoOrigem: '',
  temExperiencia: false, descricaoExperiencia: '',
  disponibilidadeFds: false,
  cursoInteresse: '',
}

const inp = 'font-body bg-night/60 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250 w-full'
const sel = `${inp} appearance-none cursor-pointer`
const lbl = 'font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block'

function Toggle({ label: l, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between bg-night/40 border border-federation/20 rounded-lg px-4 py-3">
      <span className="font-body text-fht-white text-sm">{l}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors duration-250 relative flex-shrink-0 ${value ? 'bg-gold' : 'bg-federation/40'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-250 ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )
}

function FileBtn({ file, fRef, label: lbl2, accept, onFile }: {
  file: File | null
  fRef: React.RefObject<HTMLInputElement | null>
  label: string
  accept: string
  onFile: (f: File | null) => void
}) {
  return (
    <div>
      <span className={lbl}>{lbl2} *</span>
      <input ref={fRef} type="file" accept={accept} required className="hidden"
        onChange={e => onFile(e.target.files?.[0] ?? null)} />
      <button type="button" onClick={() => fRef.current?.click()}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-body transition-colors duration-250 ${
          file ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : 'border-federation/20 bg-night/60 text-gray-soft hover:border-gold/40 hover:text-fht-white'
        }`}>
        {file
          ? <><CheckCircle size={16} className="flex-shrink-0" /><span className="truncate">{file.name}</span></>
          : <><Upload size={16} className="flex-shrink-0" /><span>Selecionar arquivo</span></>}
      </button>
    </div>
  )
}

interface Props { onClose: () => void }

export default function ArbitroForm({ onClose }: Props) {
  const [form, setForm] = useState(blank)
  const [cpfErr, setCpfErr] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [rgDoc, setRgDoc] = useState<File | null>(null)
  const [compEscolar, setCompEscolar] = useState<File | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const fotoRef = useRef<HTMLInputElement | null>(null)
  const rgRef = useRef<HTMLInputElement | null>(null)
  const escolarRef = useRef<HTMLInputElement | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    if (name === 'cpf') {
      const fmt = maskCPF(value)
      setForm(p => ({ ...p, cpf: fmt }))
      if (fmt.replace(/\D/g, '').length === 11)
        setCpfErr(validateCPF(fmt) ? '' : 'CPF inválido')
      else setCpfErr('')
      return
    }
    if (name === 'telefone') { setForm(p => ({ ...p, telefone: maskPhone(value) })); return }
    setForm(p => ({ ...p, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (cpfErr || !agreed) return
    setStatus('loading')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, String(v)))
      if (foto) data.append('foto', foto)
      if (rgDoc) data.append('rgDoc', rgDoc)
      if (compEscolar) data.append('compEscolar', compEscolar)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/arbitros/solicitar`, {
        method: 'POST',
        body: data,
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.message || `Erro ${res.status}`)
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0d1b2a] border border-federation/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-federation/20 sticky top-0 bg-[#0d1b2a] z-10">
          <div>
            <p className="font-body text-gold text-xs font-semibold tracking-widest uppercase">Corpo Arbitral</p>
            <h3 className="font-display text-fht-white text-2xl leading-tight">QUERO SER ÁRBITRO</h3>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-federation/20 text-gray-soft hover:text-gold hover:border-gold/40 transition-colors duration-250">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="font-display text-fht-white text-2xl mb-2">SOLICITAÇÃO ENVIADA!</p>
              <p className="font-body text-gray-soft text-sm">
                A FHT entrará em contato em breve com os próximos passos.
              </p>
              <button onClick={onClose}
                className="mt-6 font-display text-night bg-gold hover:bg-gold-light px-8 py-3 rounded-lg text-base tracking-wider transition-colors duration-250">
                FECHAR
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Seção 1 — Dados Pessoais */}
              <fieldset className="flex flex-col gap-4">
                <p className="font-display text-gold text-sm tracking-widest uppercase border-b border-gold/20 pb-2">1. Dados Pessoais</p>
                <div>
                  <span className={lbl}>Nome completo *</span>
                  <input required name="nomeCompleto" value={form.nomeCompleto} onChange={handleChange}
                    placeholder="Seu nome completo" className={inp} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={lbl}>Data de Nascimento *</span>
                    <input required type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange}
                      className={inp} />
                  </div>
                  <div>
                    <span className={lbl}>Sexo *</span>
                    <select required name="sexo" value={form.sexo} onChange={handleChange} className={sel}>
                      <option value="" disabled>Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={lbl}>CPF *</span>
                    <input required name="cpf" value={form.cpf} onChange={handleChange}
                      placeholder="000.000.000-00"
                      className={`${inp} ${cpfErr ? 'border-red-500' : ''}`} />
                    {cpfErr && <p className="font-body text-red-400 text-xs mt-1">{cpfErr}</p>}
                  </div>
                  <div>
                    <span className={lbl}>RG *</span>
                    <input required name="rg" value={form.rg} onChange={handleChange}
                      placeholder="0000000" className={inp} />
                  </div>
                </div>
                <div>
                  <span className={lbl}>Órgão Emissor</span>
                  <input name="orgaoEmissor" value={form.orgaoEmissor} onChange={handleChange}
                    placeholder="Ex: SSP/TO" className={inp} />
                </div>
              </fieldset>

              {/* Seção 2 — Contato */}
              <fieldset className="flex flex-col gap-4">
                <p className="font-display text-gold text-sm tracking-widest uppercase border-b border-gold/20 pb-2">2. Contato</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={lbl}>Telefone / WhatsApp *</span>
                    <input required name="telefone" value={form.telefone} onChange={handleChange}
                      placeholder="(63) 99999-9999" className={inp} />
                  </div>
                  <div>
                    <span className={lbl}>E-mail *</span>
                    <input required type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="seu@email.com" className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={lbl}>Cidade *</span>
                    <input required name="cidade" value={form.cidade} onChange={handleChange}
                      placeholder="Palmas" className={inp} />
                  </div>
                  <div>
                    <span className={lbl}>UF *</span>
                    <select required name="uf" value={form.uf} onChange={handleChange} className={sel}>
                      {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Seção 3 — Dados de Arbitragem */}
              <fieldset className="flex flex-col gap-4">
                <p className="font-display text-gold text-sm tracking-widest uppercase border-b border-gold/20 pb-2">3. Dados de Arbitragem</p>

                <Toggle label="Já é árbitro?" value={form.jaArbitro}
                  onChange={v => setForm(p => ({ ...p, jaArbitro: v }))} />
                {form.jaArbitro && (
                  <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-gold/30">
                    <div>
                      <span className={lbl}>Nível atual</span>
                      <select name="nivelAtual" value={form.nivelAtual} onChange={handleChange} className={sel}>
                        <option value="" disabled>Selecione</option>
                        {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className={lbl}>Federação de origem</span>
                      <input name="federacaoOrigem" value={form.federacaoOrigem} onChange={handleChange}
                        placeholder="Ex: FHT, FEHAM..." className={inp} />
                    </div>
                  </div>
                )}

                <Toggle label="Tem experiência com handebol?" value={form.temExperiencia}
                  onChange={v => setForm(p => ({ ...p, temExperiencia: v }))} />
                {form.temExperiencia && (
                  <div className="pl-2 border-l-2 border-gold/30">
                    <span className={lbl}>Descreva sua experiência</span>
                    <textarea name="descricaoExperiencia" value={form.descricaoExperiencia}
                      onChange={handleChange} rows={3} placeholder="Ex: jogador por 5 anos, treinador..."
                      className={`${inp} resize-none`} />
                  </div>
                )}

                <Toggle label="Disponibilidade nos fins de semana?" value={form.disponibilidadeFds}
                  onChange={v => setForm(p => ({ ...p, disponibilidadeFds: v }))} />

                <div>
                  <span className={lbl}>Curso de interesse *</span>
                  <select required name="cursoInteresse" value={form.cursoInteresse} onChange={handleChange} className={sel}>
                    <option value="" disabled>Selecione</option>
                    {CURSOS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </fieldset>

              {/* Seção 4 — Documentos */}
              <fieldset className="flex flex-col gap-4">
                <p className="font-display text-gold text-sm tracking-widest uppercase border-b border-gold/20 pb-2">4. Documentos</p>
                <div className="flex flex-col gap-4">
                  <FileBtn file={foto} fRef={fotoRef} label="Foto 3x4 digital" accept="image/*" onFile={setFoto} />
                  <FileBtn file={rgDoc} fRef={rgRef} label="RG digitalizado (PDF ou imagem)" accept=".pdf,image/*" onFile={setRgDoc} />
                  <FileBtn file={compEscolar} fRef={escolarRef} label="Comprovante de ensino médio (PDF)" accept=".pdf" onFile={setCompEscolar} />
                </div>
                <div className="flex items-start gap-3 bg-federation/5 border border-federation/20 rounded-lg px-4 py-3">
                  <Info size={15} className="text-gold flex-shrink-0 mt-0.5" />
                  <p className="font-body text-gray-soft text-xs">Arquivos aceitos: PDF e imagens. Tamanho máximo: 10 MB por arquivo.</p>
                </div>
              </fieldset>

              {/* Rodapé */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" required checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-[#F5C518] w-4 h-4 flex-shrink-0" />
                <span className="font-body text-gray-soft text-sm leading-relaxed group-hover:text-fht-white transition-colors duration-250">
                  Declaro que tenho mais de 18 anos e que as informações fornecidas são verdadeiras.
                </span>
              </label>

              {status === 'error' && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <p className="font-body text-red-400 text-sm">{errMsg}</p>
                </div>
              )}

              <button type="submit"
                disabled={status === 'loading' || !!cpfErr || !agreed}
                className="font-display text-night bg-gold hover:bg-gold-light py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
