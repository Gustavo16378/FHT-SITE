import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight, Loader2, RotateCw } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { apiGet } from '../services/api'
import SafeImage from './SafeImage'
import type { NoticiaDTO } from '../types/api'

const categoryColors: Record<string, string> = {
  'Competição': 'bg-federation/30 text-blue-300',
  'Seleção': 'bg-gold/20 text-gold',
  'Arbitragem': 'bg-green-500/20 text-green-400',
  'Institucional': 'bg-gray-soft/20 text-gray-soft',
}

const categoryGradient: Record<string, string> = {
  'Competição': 'from-federation to-blue-mid',
  'Seleção': 'from-[#F5C518] to-[#b8850a]',
  'Arbitragem': 'from-blue-mid to-federation',
  'Institucional': 'from-green-700 to-federation',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Capa da notícia: imagem quando existe/carrega, senão um gradiente pela categoria. */
function Capa({ noticia, className }: { noticia: NoticiaDTO; className?: string }) {
  return (
    <SafeImage
      src={noticia.imagemCapaUrl}
      alt={noticia.titulo}
      className={className}
      fallbackClassName={`bg-gradient-to-br ${categoryGradient[noticia.categoria] ?? 'from-federation to-night'}`}
    />
  )
}

export default function News() {
  const ref = useInView()
  const [noticias, setNoticias] = useState<NoticiaDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  function carregar() {
    setCarregando(true)
    setErro(false)
    apiGet<NoticiaDTO[]>('/api/noticias')
      .then(setNoticias)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const featured = noticias.find((n) => n.destaque) ?? noticias[0]
  const outras = noticias.filter((n) => n.id !== featured?.id)
  const secondary = outras.slice(0, 2)
  const rest = outras.slice(2, 5)

  return (
    <section id="noticias" className="py-16 sm:py-20 bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-8 sm:mb-12">
          <p className="font-body text-gold text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">Fique por dentro</p>
          <h2 className="font-display text-fht-white text-4xl sm:text-5xl lg:text-6xl leading-none mb-4">
            ÚLTIMAS DO HANDEBOL
          </h2>
          <div className="w-14 h-1 bg-gold" />
        </div>

        {carregando ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 size={22} className="text-gold animate-spin" />
            <span className="font-body text-gray-soft text-sm">Carregando notícias...</span>
          </div>
        ) : erro ? (
          <div className="border border-federation/20 rounded-lg p-10 text-center flex flex-col items-center gap-3">
            <p className="font-body text-gray-soft text-sm">Não foi possível carregar as notícias agora.</p>
            <button onClick={carregar} className="inline-flex items-center gap-2 font-body text-gold hover:text-gold-light text-sm">
              <RotateCw size={15} /> Tentar novamente
            </button>
          </div>
        ) : noticias.length === 0 ? (
          <div className="border border-federation/20 rounded-lg p-10 text-center">
            <p className="font-body text-gray-soft text-sm">Em breve, as novidades do handebol tocantinense por aqui.</p>
          </div>
        ) : (
          <>
            {/* Grid principal: destaque grande + coluna de secundárias */}
            <div className="grid lg:grid-cols-3 gap-4 mb-4">

              {/* Destaque */}
              {featured && (
                <Link
                  to={`/noticias/${featured.slug}`}
                  className="lg:col-span-2 relative rounded-lg overflow-hidden group cursor-pointer border border-federation/20 hover:border-gold/40 transition-colors duration-250 min-h-[260px] sm:min-h-[340px] block"
                >
                  <Capa noticia={featured} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[featured.categoria]}`}>
                      {featured.categoria}
                    </span>
                    <h3 className="font-display text-fht-white text-xl sm:text-2xl lg:text-3xl leading-tight mt-2 sm:mt-3 mb-2 group-hover:text-gold transition-colors duration-250 line-clamp-3">
                      {featured.titulo}
                    </h3>
                    {featured.resumo && (
                      <p className="font-body text-gray-soft text-xs sm:text-sm leading-relaxed line-clamp-2 mb-2 hidden sm:block">
                        {featured.resumo}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-gray-soft text-xs">
                      <Calendar size={11} />
                      {formatDate(featured.dataPublicacao)}
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/40 rounded-lg transition-colors duration-250 pointer-events-none" />
                </Link>
              )}

              {/* Secundárias — no mobile ficam em linha horizontal */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
                {secondary.map((item) => (
                  <Link
                    key={item.id}
                    to={`/noticias/${item.slug}`}
                    className="relative rounded-lg overflow-hidden group cursor-pointer border border-federation/20 hover:border-gold/40 transition-colors duration-250 min-h-[160px] sm:min-h-[180px] lg:flex-1 block"
                  >
                    <Capa noticia={item} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[item.categoria]}`}>
                        {item.categoria}
                      </span>
                      <h3 className="font-display text-fht-white text-base sm:text-lg leading-tight mt-1.5 group-hover:text-gold transition-colors duration-250 line-clamp-2">
                        {item.titulo}
                      </h3>
                      <div className="hidden sm:flex items-center gap-1.5 text-gray-soft text-xs mt-1">
                        <Calendar size={11} />
                        {formatDate(item.dataPublicacao)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Cards extras */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {rest.map((item) => (
                  <Link
                    key={item.id}
                    to={`/noticias/${item.slug}`}
                    className="bg-section-alt/60 border border-federation/20 rounded-lg overflow-hidden hover:border-gold/40 transition-colors duration-250 group cursor-pointer block"
                  >
                    <div className="h-40 overflow-hidden">
                      <Capa noticia={item} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[item.categoria]}`}>{item.categoria}</span>
                      <h3 className="font-display text-fht-white text-xl leading-tight mt-2 group-hover:text-gold transition-colors duration-250 line-clamp-2">{item.titulo}</h3>
                      <div className="flex items-center gap-1.5 text-gray-soft text-xs mt-2"><Calendar size={11} />{formatDate(item.dataPublicacao)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-center mt-8">
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 font-display text-fht-white border border-fht-white/20 hover:border-gold hover:text-gold px-8 py-3 rounded-lg text-lg tracking-wider transition-colors duration-250"
          >
            VER TODAS AS NOTÍCIAS <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
