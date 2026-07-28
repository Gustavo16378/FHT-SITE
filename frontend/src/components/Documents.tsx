import { useEffect, useState } from 'react'
import { FileText, Download, Eye, X, Loader2, RotateCw } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { apiGet, fileUrl } from '../services/api'
import type { DocumentoDTO, DocumentoCategoria } from '../types/api'

const categories: (DocumentoCategoria | 'Todos')[] = ['Todos', 'Estatuto', 'Regulamento', 'Calendário', 'Edital', 'Circular']

const categoryColors: Record<DocumentoCategoria, string> = {
  'Estatuto': 'text-gold border-gold/30 bg-gold/10',
  'Regulamento': 'text-blue-300 border-blue-400/30 bg-blue-mid/10',
  'Calendário': 'text-green-400 border-green-500/30 bg-green-500/10',
  'Edital': 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  'Circular': 'text-gray-soft border-gray-soft/30 bg-gray-soft/10',
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
  )
}

export default function Documents() {
  const ref = useInView()
  const [documentos, setDocumentos] = useState<DocumentoDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [active, setActive] = useState<DocumentoCategoria | 'Todos'>('Todos')
  const [viewerDoc, setViewerDoc] = useState<DocumentoDTO | null>(null)

  function carregar() {
    setCarregando(true)
    setErro(false)
    apiGet<DocumentoDTO[]>('/api/documentos')
      .then(setDocumentos)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }
  useEffect(() => { carregar() }, [])

  const filtered = active === 'Todos' ? documentos : documentos.filter((d) => d.categoria === active)

  return (
    <section id="documentos" className="py-20 bg-fht-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-12">
          <p className="font-body text-federation text-sm font-semibold tracking-widest uppercase mb-2">Acesso à informação</p>
          <h2 className="font-display text-night text-5xl sm:text-6xl leading-none mb-4">
            TRANSPARÊNCIA E<br className="hidden sm:block" />{' '}
            ACESSO À INFORMAÇÃO
          </h2>
          <div className="w-16 h-1 bg-gold" />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-body text-sm font-medium px-4 py-2 rounded-lg border transition-colors duration-250 ${
                active === cat
                  ? 'bg-federation border-federation text-white'
                  : 'bg-white border-gray-200 text-night hover:border-federation/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 size={22} className="text-federation animate-spin" />
            <span className="font-body text-night/60 text-sm">Carregando documentos...</span>
          </div>
        ) : erro ? (
          <div className="border border-gray-200 rounded-lg p-10 text-center flex flex-col items-center gap-3">
            <p className="font-body text-night/60 text-sm">Não foi possível carregar os documentos agora.</p>
            <button onClick={carregar} className="inline-flex items-center gap-2 font-body text-federation hover:text-night text-sm"><RotateCw size={15} /> Tentar novamente</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-gray-200 rounded-lg p-10 text-center">
            <FileText size={30} className="text-night/30 mx-auto mb-3" />
            <p className="font-body text-night/60 text-sm">{documentos.length === 0 ? 'Em breve, os documentos oficiais da federação estarão disponíveis aqui.' : 'Nenhum documento nesta categoria.'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-federation/40 transition-colors duration-250 group">
                <div className="w-10 h-10 bg-federation/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-federation/20 transition-colors duration-250">
                  <FileText size={18} className="text-federation" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-night text-sm font-semibold truncate">{doc.titulo}</p>
                  <p className="font-body text-gray-400 text-xs mt-0.5">
                    Publicado em {new Date(doc.dataPublicacao + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`font-body text-xs px-2 py-0.5 rounded-full border flex-shrink-0 hidden sm:block ${categoryColors[doc.categoria]}`}>
                  {doc.categoria}
                </span>
                <button onClick={() => setViewerDoc(doc)} className="flex items-center gap-1.5 text-federation hover:text-gold transition-colors duration-250 flex-shrink-0 font-body text-xs font-semibold">
                  <Eye size={16} /> <span className="hidden sm:block">Ver</span>
                </button>
                <a href={fileUrl(doc.arquivoUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-federation hover:text-gold transition-colors duration-250 flex-shrink-0">
                  <Download size={16} />
                  <span className="font-body text-xs font-semibold hidden sm:block">PDF</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewerDoc && <ViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} />}
    </section>
  )
}
