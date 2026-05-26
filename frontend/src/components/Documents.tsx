import { FileText, Download } from 'lucide-react'
import { documents } from '../data/documents'
import type { DocumentCategory } from '../data/documents'
import { useState } from 'react'
import { useInView } from '../hooks/useInView'

const categories: (DocumentCategory | 'Todos')[] = ['Todos', 'Estatuto', 'Regulamento', 'Calendário', 'Edital', 'Circular']

const categoryColors: Record<DocumentCategory, string> = {
  'Estatuto': 'text-gold border-gold/30 bg-gold/10',
  'Regulamento': 'text-blue-300 border-blue-400/30 bg-blue-mid/10',
  'Calendário': 'text-green-400 border-green-500/30 bg-green-500/10',
  'Edital': 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  'Circular': 'text-gray-soft border-gray-soft/30 bg-gray-soft/10',
}

export default function Documents() {
  const ref = useInView()
  const [active, setActive] = useState<DocumentCategory | 'Todos'>('Todos')

  const filtered = active === 'Todos' ? documents : documents.filter((d) => d.category === active)

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

        {/* Lista */}
        <div className="flex flex-col gap-3">
          {filtered.map((doc) => (
            <a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-federation/40 transition-colors duration-250 group"
            >
              <div className="w-10 h-10 bg-federation/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-federation/20 transition-colors duration-250">
                <FileText size={18} className="text-federation" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-night text-sm font-semibold group-hover:text-federation transition-colors duration-250 truncate">
                  {doc.title}
                </p>
                <p className="font-body text-gray-400 text-xs mt-0.5">
                  Publicado em {new Date(doc.publishedAt + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className={`font-body text-xs px-2 py-0.5 rounded-full border flex-shrink-0 hidden sm:block ${categoryColors[doc.category]}`}>
                {doc.category}
              </span>
              <div className="flex items-center gap-2 text-federation group-hover:text-gold transition-colors duration-250 flex-shrink-0">
                <Download size={16} />
                <span className="font-body text-xs font-semibold hidden sm:block">PDF</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
