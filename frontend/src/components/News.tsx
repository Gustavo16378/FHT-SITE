import { Calendar, ArrowRight } from 'lucide-react'
import { news } from '../data/news'
import { useInView } from '../hooks/useInView'

const categoryColors: Record<string, string> = {
  'Competição': 'bg-federation/30 text-blue-300',
  'Seleção': 'bg-gold/20 text-gold',
  'Arbitragem': 'bg-green-500/20 text-green-400',
  'Institucional': 'bg-gray-soft/20 text-gray-soft',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function News() {
  const ref = useInView()
  const featured = news.find((n) => n.featured)
  const secondary = news.filter((n) => !n.featured).slice(0, 2)
  const rest = news.filter((n) => !n.featured).slice(2)

  return (
    <section id="noticias" className="py-16 sm:py-20 bg-night diagonal-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-8 sm:mb-12">
          <p className="font-body text-gold text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">Fique por dentro</p>
          <h2 className="font-display text-fht-white text-4xl sm:text-5xl lg:text-6xl leading-none mb-4">
            ÚLTIMAS DO HANDEBOL
          </h2>
          <div className="w-14 h-1 bg-gold" />
        </div>

        {/* Grid principal: destaque grande + coluna de secundárias */}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">

          {/* Destaque */}
          {featured && (
            <div className="lg:col-span-2 relative rounded-lg overflow-hidden group cursor-pointer border border-federation/20 hover:border-gold/40 transition-all duration-250 min-h-[260px] sm:min-h-[340px]">
              <img
                src={featured.image}
                alt={featured.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[featured.category]}`}>
                  {featured.category}
                </span>
                <h3 className="font-display text-fht-white text-xl sm:text-2xl lg:text-3xl leading-tight mt-2 sm:mt-3 mb-2 group-hover:text-gold transition-colors duration-250 line-clamp-3">
                  {featured.title}
                </h3>
                <p className="font-body text-gray-soft text-xs sm:text-sm leading-relaxed line-clamp-2 mb-2 hidden sm:block">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-1.5 text-gray-soft text-xs">
                  <Calendar size={11} />
                  {formatDate(featured.date)}
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/40 rounded-lg transition-all duration-250 pointer-events-none" />
            </div>
          )}

          {/* Secundárias — no mobile ficam em linha horizontal */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
            {secondary.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden group cursor-pointer border border-federation/20 hover:border-gold/40 transition-all duration-250 min-h-[160px] sm:min-h-[180px] lg:flex-1"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
                    {item.category}
                  </span>
                  <h3 className="font-display text-fht-white text-base sm:text-lg leading-tight mt-1.5 group-hover:text-gold transition-colors duration-250 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="hidden sm:flex items-center gap-1.5 text-gray-soft text-xs mt-1">
                    <Calendar size={11} />
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards extras */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {rest.map((item) => (
              <div
                key={item.id}
                className="bg-section-alt/60 border border-federation/20 rounded-lg overflow-hidden hover:border-gold/40 transition-all duration-250 group cursor-pointer"
              >
                <div className="h-40 overflow-hidden">
                  <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>{item.category}</span>
                  <h3 className="font-display text-fht-white text-xl leading-tight mt-2 group-hover:text-gold transition-colors duration-250">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-gray-soft text-xs mt-2"><Calendar size={11} />{formatDate(item.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <a
            href="#"
            className="inline-flex items-center gap-2 font-display text-fht-white border border-fht-white/20 hover:border-gold hover:text-gold px-8 py-3 rounded-lg text-lg tracking-wider transition-all duration-250"
          >
            VER TODAS AS NOTÍCIAS <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
