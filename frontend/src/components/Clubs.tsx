import { MapPin, ArrowRight } from 'lucide-react'
import { clubs } from '../data/clubs'
import { useInView } from '../hooks/useInView'

const bgColors = [
  'from-federation/30 to-blue-mid/20',
  'from-blue-mid/20 to-federation/10',
  'from-section-alt to-federation/20',
]

export default function Clubs() {
  const ref = useInView()

  return (
    <section id="clubes" className="py-20 bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-12">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">Ecossistema</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">
            CLUBES QUE FAZEM O<br className="hidden sm:block" />{' '}
            <span className="text-gold">HANDEBOL ACONTECER</span>
          </h2>
          <div className="w-16 h-1 bg-gold" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {clubs.map((club, i) => (
            <div
              key={club.id}
              className={`bg-gradient-to-br ${bgColors[i % bgColors.length]} border border-federation/20 rounded-lg p-4 sm:p-5 hover:border-gold/50 hover:-translate-y-1 transition-all duration-250 group cursor-pointer overflow-hidden`}
            >
              {/* Escudo / Iniciais */}
              <div className="w-12 h-12 bg-federation/40 border border-federation/50 rounded-lg flex items-center justify-center mb-3 group-hover:border-gold/50 transition-colors duration-250 flex-shrink-0">
                {club.logo ? (
                  <img src={club.logo} alt={club.name} className="w-9 h-9 object-contain" />
                ) : (
                  <span className="font-display text-gold text-lg">{club.initials}</span>
                )}
              </div>

              <h3 className="font-display text-fht-white text-lg leading-tight group-hover:text-gold transition-colors duration-250 mb-1 line-clamp-2">
                {club.name}
              </h3>

              <div className="flex items-center gap-1 text-gray-soft text-xs mb-3 truncate">
                <MapPin size={10} className="flex-shrink-0" />
                <span className="truncate">{club.city}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {club.categories.slice(0, 3).map((cat) => (
                  <span key={cat} className="font-body text-xs text-gray-soft border border-gray-soft/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#contato"
            className="inline-flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-8 py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20"
          >
            FILIAR MEU CLUBE <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
