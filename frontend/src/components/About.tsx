import { useEffect, useState } from 'react'
import { Trophy, Compass, Shield, FileText, Download, X, Mail, Phone, Calendar, Loader2 } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { apiGet, fileUrl } from '../services/api'
import type { DiretorDTO, DocumentoDTO } from '../types/api'

const mvv = [
  {
    icon: Trophy,
    title: 'MISSÃO',
    text: 'Desenvolver, organizar e promover o handebol no estado do Tocantins em todas as categorias, formando atletas e fortalecendo clubes.',
  },
  {
    icon: Compass,
    title: 'VISÃO',
    text: 'Ser referência nacional no desenvolvimento do handebol, colocando o Tocantins entre os estados de maior produção esportiva do Brasil.',
  },
  {
    icon: Shield,
    title: 'VALORES',
    text: 'Ética, transparência, inclusão social, excelência esportiva e respeito às regras do esporte e de seus praticantes.',
  },
]

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map((n) => n[0]).join('')
}

/** Avatar do diretor: foto quando existe/carrega, senão iniciais. */
function Avatar({ diretor, className }: { diretor: DiretorDTO; className?: string }) {
  const [erro, setErro] = useState(false)
  if (!diretor.fotoUrl || erro) {
    return <span className="font-display text-gold text-xl sm:text-2xl">{iniciais(diretor.nome)}</span>
  }
  return <img src={fileUrl(diretor.fotoUrl)} alt={diretor.nome} loading="lazy" className={className} onError={() => setErro(true)} />
}

function DiretorModal({ diretor, onClose }: { diretor: DiretorDTO; onClose: () => void }) {
  const paragrafos = (diretor.bio ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const contatos = [
    diretor.area && { icon: Shield, rot: 'Área', val: diretor.area },
    diretor.desde && { icon: Calendar, rot: 'Na diretoria desde', val: diretor.desde },
    diretor.email && { icon: Mail, rot: 'E-mail', val: diretor.email },
    diretor.telefone && { icon: Phone, rot: 'Telefone', val: diretor.telefone },
  ].filter(Boolean) as { icon: typeof Mail; rot: string; val: string }[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-federation/20 flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-federation/20 border border-federation/40 flex items-center justify-center shrink-0 overflow-hidden">
            <Avatar diretor={diretor} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-fht-white text-xl tracking-wide leading-none">{diretor.nome}</h3>
            <p className="font-body text-gold text-sm mt-1">{diretor.cargo}</p>
            {diretor.mandato && (
              <span className="inline-flex items-center gap-1.5 font-body text-xs text-gray-soft mt-2"><Calendar size={13} /> Mandato {diretor.mandato}</span>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-gray-soft hover:text-fht-white transition-colors duration-150 shrink-0" aria-label="Fechar"><X size={22} /></button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          {contatos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contatos.map((c) => (
                <div key={c.rot} className="bg-[#0d1b2a]/60 border border-federation/20 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
                  <c.icon size={16} className="text-blue-300 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-body text-gray-soft text-[10px] uppercase tracking-wider block">{c.rot}</span>
                    <span className="font-body text-fht-white text-sm truncate block">{c.val}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {paragrafos.length > 0 && (
            <div>
              <p className="font-display text-gold text-xs tracking-widest mb-3">CURRÍCULO</p>
              <div className="flex flex-col gap-3">
                {paragrafos.map((p, i) => <p key={i} className="font-body text-gray-soft text-sm leading-relaxed">{p}</p>)}
              </div>
            </div>
          )}
          {paragrafos.length === 0 && contatos.length === 0 && (
            <p className="font-body text-gray-soft text-sm">Sem informações adicionais.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function About() {
  const ref = useInView()
  const [diretores, setDiretores] = useState<DiretorDTO[]>([])
  const [docsDestaque, setDocsDestaque] = useState<DocumentoDTO[]>([])
  const [carregandoDir, setCarregandoDir] = useState(true)
  const [selecionado, setSelecionado] = useState<DiretorDTO | null>(null)

  useEffect(() => {
    apiGet<DiretorDTO[]>('/api/diretores').then(setDiretores).catch(() => setDiretores([])).finally(() => setCarregandoDir(false))
    apiGet<DocumentoDTO[]>('/api/documentos')
      .then((docs) => {
        const estatutos = docs.filter((d) => d.categoria === 'Estatuto')
        setDocsDestaque((estatutos.length > 0 ? estatutos : docs).slice(0, 3))
      })
      .catch(() => setDocsDestaque([]))
  }, [])

  return (
    <section id="sobre" className="py-20 bg-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-14">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">Quem somos</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">
            GOVERNANDO E DESENVOLVENDO O<br className="hidden sm:block" />{' '}
            <span className="text-gold">HANDEBOL TOCANTINENSE</span>
          </h2>
          <div className="w-16 h-1 bg-gold mb-8" />
          <div className="max-w-3xl">
            <p className="font-body text-gray-soft text-lg leading-relaxed mb-4">
              A <strong className="text-fht-white">FHT — Federação de Handebol do Tocantins</strong> é a entidade oficial que regula,
              organiza e desenvolve o handebol em todo o estado do Tocantins. Filiada à{' '}
              <strong className="text-fht-white">CBHb — Confederação Brasileira de Handebol</strong>, a FHT é responsável
              pelas competições estaduais, credenciamento de árbitros, registro de atletas e filiação de clubes.
            </p>
            <p className="font-body text-gray-soft leading-relaxed">
              Com sede em Palmas, a federação atua em todo o estado promovendo o esporte em todas as categorias de base e adulto,
              com foco no desenvolvimento humano e na formação de atletas de alta performance.
            </p>
          </div>
        </div>

        {/* Missão, Visão e Valores */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {mvv.map((item) => (
            <div key={item.title} className="bg-night/50 border border-federation/20 rounded-lg p-6 hover:border-gold/30 transition-colors duration-250 group">
              <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-lg flex items-center justify-center mb-4 group-hover:border-gold/50 transition-colors duration-250">
                <item.icon size={20} className="text-gold" />
              </div>
              <h3 className="font-display text-gold text-2xl leading-none mb-3">{item.title}</h3>
              <p className="font-body text-gray-soft text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Diretoria */}
        {(carregandoDir || diretores.length > 0) && (
          <div className="mb-20">
            <h3 className="font-display text-fht-white text-4xl leading-none mb-2">DIRETORIA</h3>
            <div className="w-10 h-0.5 bg-gold mb-8" />
            {carregandoDir ? (
              <div className="flex items-center gap-3 py-8"><Loader2 size={20} className="text-gold animate-spin" /><span className="font-body text-gray-soft text-sm">Carregando diretoria...</span></div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {diretores.map((dir) => (
                  <button key={dir.id} type="button" onClick={() => setSelecionado(dir)} className="group text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-lg bg-federation/30 border border-federation/30 group-hover:border-gold/50 transition-colors duration-250 flex items-center justify-center mb-2 overflow-hidden">
                      <Avatar diretor={dir} className="w-full h-full object-cover" />
                    </div>
                    <p className="font-display text-fht-white text-xs sm:text-sm leading-tight uppercase line-clamp-2 group-hover:text-gold transition-colors duration-250">{dir.nome}</p>
                    <p className="font-body text-gray-soft text-xs mt-1 truncate">{dir.cargo}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documentos institucionais */}
        {docsDestaque.length > 0 && (
          <div>
            <h3 className="font-display text-fht-white text-4xl leading-none mb-2">DOCUMENTOS INSTITUCIONAIS</h3>
            <div className="w-10 h-0.5 bg-gold mb-8" />
            <div className="flex flex-col gap-3">
              {docsDestaque.map((doc) => (
                <a key={doc.id} href={fileUrl(doc.arquivoUrl)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-night/50 border border-federation/20 rounded-lg px-5 py-4 hover:border-gold/40 transition-colors duration-250 group">
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-250">
                    <FileText size={18} className="text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-fht-white text-sm font-semibold group-hover:text-gold transition-colors duration-250">{doc.titulo}</p>
                    <p className="font-body text-gray-soft text-xs mt-0.5">Publicado em {new Date(doc.dataPublicacao + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Download size={16} className="text-gray-soft group-hover:text-gold transition-colors duration-250 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {selecionado && <DiretorModal diretor={selecionado} onClose={() => setSelecionado(null)} />}
    </section>
  )
}
