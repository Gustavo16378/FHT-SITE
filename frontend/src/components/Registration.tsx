import { useState, useRef } from 'react'
import { Shield, CheckCircle, X, Upload, AlertCircle, Info } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { maskCPF, maskCNPJ, maskPhone, validateCPF, validateCNPJ } from '../utils/masks'
import { UFS } from '../utils/ufs'

const clubBenefits = [
  'Filiação oficial à FHT e CBHb',
  'Acesso ao sistema de gestão de competições',
  'Inscrição em todos os torneios oficiais',
  'Suporte técnico e institucional da federação',
]

const CARGOS = ['Presidente', 'Diretor', 'Secretário', 'Outro']

const blank = {
  nomeClube: '', sigla: '', cidade: '', uf: 'TO', cnpj: '',
  nomeRepresentante: '', cpfRepresentante: '', cargo: '', emailRepresentante: '', telefoneRepresentante: '',
}

const inp = 'font-body bg-night/60 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250 w-full'
const sel = `${inp} appearance-none cursor-pointer`
const lbl = 'font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block'

export default function Registration() {
  const ref = useInView()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blank)
  const [ata, setAta] = useState<File | null>(null)
  const [estatuto, setEstatuto] = useState<File | null>(null)
  const [cpfErr, setCpfErr] = useState('')
  const [cnpjErr, setCnpjErr] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const ataRef = useRef<HTMLInputElement | null>(null)
  const estatutoRef = useRef<HTMLInputElement | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    if (name === 'cpfRepresentante') {
      const fmt = maskCPF(value)
      setForm(p => ({ ...p, cpfRepresentante: fmt }))
      if (fmt.replace(/\D/g, '').length === 11)
        setCpfErr(validateCPF(fmt) ? '' : 'CPF inválido')
      else setCpfErr('')
      return
    }
    if (name === 'cnpj') {
      const fmt = maskCNPJ(value)
      setForm(p => ({ ...p, cnpj: fmt }))
      if (fmt.replace(/\D/g, '').length === 14)
        setCnpjErr(validateCNPJ(fmt) ? '' : 'CNPJ inválido')
      else setCnpjErr('')
      return
    }
    if (name === 'telefoneRepresentante') {
      setForm(p => ({ ...p, [name]: maskPhone(value) }))
      return
    }
    setForm(p => ({ ...p, [name]: value }))
  }

  function handleClose() {
    setOpen(false)
    setForm(blank)
    setAta(null)
    setEstatuto(null)
    setCpfErr('')
    setCnpjErr('')
    setAgreed(false)
    setStatus('idle')
    setErrMsg('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (cpfErr || cnpjErr || !agreed) return
    setStatus('loading')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v) })
      if (ata) data.append('ataFundacao', ata)
      if (estatuto) data.append('estatuto', estatuto)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clubes/solicitar`, {
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

  function FileBtn({ file, fRef, label: lbl2, onFile }: {
    file: File | null
    fRef: React.RefObject<HTMLInputElement | null>
    label: string
    onFile: (f: File | null) => void
  }) {
    return (
      <div>
        <span className={lbl}>{lbl2} *</span>
        <input ref={fRef} type="file" accept=".pdf" required className="hidden"
          onChange={e => onFile(e.target.files?.[0] ?? null)} />
        <button type="button" onClick={() => fRef.current?.click()}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-body transition-colors duration-250 ${
            file ? 'border-green-500/50 bg-green-500/10 text-green-400'
                  : 'border-federation/20 bg-night/60 text-gray-soft hover:border-gold/40 hover:text-fht-white'
          }`}>
          {file
            ? <><CheckCircle size={16} className="flex-shrink-0" /><span className="truncate">{file.name}</span></>
            : <><Upload size={16} className="flex-shrink-0" /><span>Selecionar PDF</span></>}
        </button>
      </div>
    )
  }

  return (
    <>
      <section id="cadastro" className="py-20 bg-section-alt diagonal-texture relative overflow-hidden">
        <div className="absolute inset-0 bg-federation/5 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready text-center mb-14">
            <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">Filiação Oficial</p>
            <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">
              FAÇA PARTE DO HANDEBOL DO TOCANTINS
            </h2>
            <div className="w-16 h-1 bg-gold mx-auto" />
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-night/60 border border-federation/30 rounded-lg p-8 hover:border-gold/40 transition-all duration-250 group flex flex-col">
              <div className="w-14 h-14 bg-federation/20 border border-federation/40 rounded-lg flex items-center justify-center mb-6 group-hover:border-gold/40 transition-colors duration-250">
                <Shield size={28} className="text-gold" />
              </div>
              <h3 className="font-display text-fht-white text-3xl leading-none mb-2">CADASTRAR CLUBE/EQUIPE</h3>
              <p className="font-body text-gray-soft text-sm mb-6 leading-relaxed">
                Filie seu clube à FHT e tenha acesso a todos os torneios oficiais, suporte técnico e reconhecimento institucional.
              </p>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {clubBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
                    <span className="font-body text-fht-white text-sm">{b}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setOpen(true)}
                className="font-display text-night bg-gold hover:bg-gold-light text-center py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20"
              >
                SOLICITAR FILIAÇÃO
              </button>
            </div>
          </div>

          <p className="font-body text-gray-soft text-xs text-center mt-8">
            Cadastro gratuito · Dados protegidos pela{' '}
            <span className="text-fht-white">LGPD — Lei Geral de Proteção de Dados</span>
          </p>
        </div>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={handleClose}
        >
          <div
            className="bg-[#0d1b2a] border border-federation/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-federation/20 sticky top-0 bg-[#0d1b2a] z-10">
              <div>
                <p className="font-body text-gold text-xs font-semibold tracking-widest uppercase">Filiação Oficial</p>
                <h3 className="font-display text-fht-white text-2xl leading-tight">SOLICITAÇÃO DE FILIAÇÃO</h3>
              </div>
              <button onClick={handleClose}
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
                    A FHT entrará em contato em até 5 dias úteis.
                  </p>
                  <button onClick={handleClose}
                    className="mt-6 font-display text-night bg-gold hover:bg-gold-light px-8 py-3 rounded-lg text-base tracking-wider transition-colors duration-250">
                    FECHAR
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                  {/* Seção 1 — Dados do Clube */}
                  <fieldset className="flex flex-col gap-4">
                    <p className="font-display text-gold text-sm tracking-widest uppercase border-b border-gold/20 pb-2">1. Dados do Clube</p>
                    <div>
                      <span className={lbl}>Nome do Clube *</span>
                      <input required name="nomeClube" value={form.nomeClube} onChange={handleChange}
                        placeholder="Ex: Associação Esportiva Palmas HC" className={inp} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className={lbl}>CNPJ (opcional)</span>
                        <input name="cnpj" value={form.cnpj} onChange={handleChange}
                          placeholder="00.000.000/0000-00"
                          className={`${inp} ${cnpjErr ? 'border-red-500' : ''}`} />
                        {cnpjErr && <p className="font-body text-red-400 text-xs mt-1">{cnpjErr}</p>}
                      </div>
                      <div>
                        <span className={lbl}>Sigla (opcional)</span>
                        <input name="sigla" value={form.sigla} onChange={handleChange}
                          placeholder="Ex: PHC" maxLength={6} className={inp} />
                      </div>
                    </div>
                  </fieldset>

                  {/* Seção 2 — Dados do Representante */}
                  <fieldset className="flex flex-col gap-4">
                    <p className="font-display text-gold text-sm tracking-widest uppercase border-b border-gold/20 pb-2">2. Dados do Representante Legal</p>
                    <div>
                      <span className={lbl}>Nome completo *</span>
                      <input required name="nomeRepresentante" value={form.nomeRepresentante} onChange={handleChange}
                        placeholder="Nome do representante" className={inp} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className={lbl}>CPF *</span>
                        <input required name="cpfRepresentante" value={form.cpfRepresentante} onChange={handleChange}
                          placeholder="000.000.000-00"
                          className={`${inp} ${cpfErr ? 'border-red-500' : ''}`} />
                        {cpfErr && <p className="font-body text-red-400 text-xs mt-1">{cpfErr}</p>}
                      </div>
                      <div>
                        <span className={lbl}>Cargo no Clube *</span>
                        <select required name="cargo" value={form.cargo} onChange={handleChange} className={sel}>
                          <option value="" disabled>Selecione</option>
                          {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className={lbl}>E-mail *</span>
                        <input required type="email" name="emailRepresentante" value={form.emailRepresentante}
                          onChange={handleChange} placeholder="email@clube.com.br" className={inp} />
                      </div>
                      <div>
                        <span className={lbl}>Telefone / WhatsApp *</span>
                        <input required type="tel" name="telefoneRepresentante" value={form.telefoneRepresentante}
                          onChange={handleChange} placeholder="(63) 99999-9999" className={inp} />
                      </div>
                    </div>
                  </fieldset>

                  {/* Seção 3 — Documentos */}
                  <fieldset className="flex flex-col gap-4">
                    <p className="font-display text-gold text-sm tracking-widest uppercase border-b border-gold/20 pb-2">3. Documentos (PDF)</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FileBtn file={ata} fRef={ataRef} label="Ata de Fundação" onFile={setAta} />
                      <FileBtn file={estatuto} fRef={estatutoRef} label="Estatuto do Clube" onFile={setEstatuto} />
                    </div>
                  </fieldset>

                  {/* Rodapé */}
                  <div className="flex items-start gap-3 bg-gold/5 border border-gold/20 rounded-lg px-4 py-3">
                    <Info size={16} className="text-gold flex-shrink-0 mt-0.5" />
                    <p className="font-body text-gray-soft text-xs leading-relaxed">
                      Há uma <span className="text-fht-white">taxa de filiação anual</span> a ser confirmada pela FHT após aprovação da solicitação.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" required checked={agreed} onChange={e => setAgreed(e.target.checked)}
                      className="mt-0.5 accent-[#F5C518] w-4 h-4 flex-shrink-0" />
                    <span className="font-body text-gray-soft text-sm leading-relaxed group-hover:text-fht-white transition-colors duration-250">
                      Declaro que as informações são verdadeiras e estou ciente das regras da FHT.
                    </span>
                  </label>

                  {status === 'error' && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                      <p className="font-body text-red-400 text-sm">{errMsg}</p>
                    </div>
                  )}

                  <button type="submit"
                    disabled={status === 'loading' || !!cpfErr || !!cnpjErr || !agreed}
                    className="font-display text-night bg-gold hover:bg-gold-light py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
