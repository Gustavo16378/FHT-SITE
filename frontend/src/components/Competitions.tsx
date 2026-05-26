import { useState } from 'react'
import { MapPin, Users, Calendar, ChevronRight } from 'lucide-react'
import { competitions } from '../data/competitions'
import type { CompetitionStatus, CompetitionCategory } from '../data/competitions'
import { useInView } from '../hooks/useInView'

const statusLabels: Record<CompetitionStatus, string> = {
  'em-andamento': 'Em Andamento',
  'inscricoes-abertas': 'Inscrições Abertas',
  'em-breve': 'Em Breve',
  encerrado: 'Encerrado',
}

const statusColors: Record<CompetitionStatus, string> = {
  'em-andamento': 'bg-green-500/20 text-green-400 border-green-500/40',
  'inscricoes-abertas': 'bg-gold/20 text-gold border-gold/40',
  'em-breve': 'bg-blue-mid/20 text-blue-300 border-blue-400/40',
  encerrado: 'bg-gray-soft/10 text-gray-soft border-gray-soft/30',
}

const statusFilters: { label: string; value: CompetitionStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Em andamento', value: 'em-andamento' },
  { label: 'Inscrições abertas', value: 'inscricoes-abertas' },
  { label: 'Em breve', value: 'em-breve' },
  { label: 'Encerrados', value: 'encerrado' },
]

const categoryFilters = ['Todos', 'Adulto', 'Sub-18', 'Sub-16', 'Sub-14', 'Sub-12', 'Feminino', 'Masculino']

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function CompetitionCTA({ comp }: { comp: (typeof competitions)[0] }) {
  if (comp.status === 'encerrado') {
    return (
      <span className="inline-block font-body text-gray-soft text-xs border border-gray-soft/20 px-3 py-1.5 rounded-lg">
        Encerrado
      </span>
    )
  }
  if (comp.status === 'inscricoes-abertas' && comp.registrationLink) {
    return (
      <a
        href={comp.registrationLink}
        className="inline-flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-4 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 w-full sm:w-auto justify-center"
      >
        INSCREVER EQUIPE <ChevronRight size={15} />
      </a>
    )
  }
  if (comp.status === 'em-breve') {
    return (
      <span className="inline-block font-display text-blue-300 text-xs border border-blue-400/40 bg-blue-mid/10 px-3 py-1.5 rounded-lg tracking-wider">
        EM BREVE
      </span>
    )
  }
  // em-andamento sem link de inscrição
  return (
    <span className="inline-block font-display text-green-400 text-xs border border-green-500/30 bg-green-500/10 px-3 py-1.5 rounded-lg tracking-wider">
      EM ANDAMENTO
    </span>
  )
}

export default function Competitions() {
  const ref = useInView()
  const [activeStatus, setActiveStatus] = useState<CompetitionStatus | 'todos'>('todos')
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filtered = competitions.filter((c) => {
    const statusOk = activeStatus === 'todos' || c.status === activeStatus
    const categoryOk =
      activeCategory === 'Todos' ||
      c.category.some(
        (cat) => cat === (activeCategory.toLowerCase() as CompetitionCategory)
      )
    return statusOk && categoryOk
  })

  return (
    <section id="competicoes" className="py-16 sm:py-20 bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-8 sm:mb-12">
          <p className="font-body text-gold text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
            Temporada 2025
          </p>
          <h2 className="font-display text-fht-white text-4xl sm:text-5xl lg:text-6xl leading-none mb-4">
            COMPETIÇÕES EM ANDAMENTO
          </h2>
          <div className="w-14 h-1 bg-gold" />
        </div>

        {/* Filtros status — scroll horizontal sem scrollbar visível */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto mb-3">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveStatus(f.value)}
              className={`font-body text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap border transition-all duration-250 flex-shrink-0 ${
                activeStatus === f.value
                  ? 'bg-federation border-federation text-fht-white'
                  : 'bg-transparent border-gray-soft/20 text-gray-soft hover:border-gray-soft/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Filtros categoria */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 mb-6 sm:mb-8">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-body text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border transition-all duration-250 flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-gold border-gold text-night'
                  : 'bg-transparent border-gold/20 text-gray-soft hover:border-gold/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {filtered.length === 0 ? (
            <p className="font-body text-gray-soft text-center py-12">
              Nenhuma competição encontrada.
            </p>
          ) : (
            filtered.map((comp) => (
              <div
                key={comp.id}
                className="bg-section-alt/70 border border-federation/20 rounded-lg overflow-hidden hover:border-federation/50 transition-all duration-250 group"
              >
                {/* Barra colorida sempre à esquerda */}
                <div className="flex">
                  <div className="w-1 flex-shrink-0 self-stretch" style={{ backgroundColor: comp.color }} />

                  <div className="flex-1 p-4 sm:p-5">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[comp.status]}`}>
                        {statusLabels[comp.status]}
                      </span>
                      {comp.category.map((cat) => (
                        <span
                          key={cat}
                          className="font-body text-xs text-gray-soft border border-gray-soft/20 px-1.5 py-0.5 rounded-full capitalize"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Nome */}
                    <h3 className="font-display text-fht-white text-xl sm:text-2xl lg:text-3xl leading-tight mb-3 group-hover:text-gold transition-colors duration-250">
                      {comp.name}
                    </h3>

                    {/* Infos */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-4 text-gray-soft text-xs sm:text-sm font-body mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-gold flex-shrink-0" />
                        {formatDate(comp.startDate)} — {formatDate(comp.endDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gold flex-shrink-0" />
                        {comp.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={12} className="text-gold flex-shrink-0" />
                        {comp.teams} equipes
                      </span>
                    </div>

                    {/* CTA */}
                    <CompetitionCTA comp={comp} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="font-body text-gray-soft text-xs text-center mt-6">
          Inscrições via sistema oficial da FHT ·{' '}
          <a href="#contato" className="text-gold hover:underline">
            Dúvidas? Fale conosco
          </a>
        </p>
      </div>
    </section>
  )
}
