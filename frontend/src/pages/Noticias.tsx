import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Loader2, Newspaper, RotateCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SafeImage from '../components/SafeImage'
import { apiGet } from '../services/api'
import type { NoticiaDTO, NoticiaCategoria } from '../types/api'

const CATEGORIAS: NoticiaCategoria[] = ['Institucional', 'Competição', 'Arbitragem', 'Seleção']

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
    month: 'long',
    year: 'numeric',
  })
}

export default function Noticias() {
  const [noticias, setNoticias] = useState<NoticiaDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [filtro, setFiltro] = useState<NoticiaCategoria | 'Todas'>('Todas')

  function carregar() {
    setCarregando(true)
    setErro(false)
    apiGet<NoticiaDTO[]>('/api/noticias')
      .then(setNoticias)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    carregar()
  }, [])

  const lista = filtro === 'Todas' ? noticias : noticias.filter((n) => n.categoria === filtro)

  return (
    <div className="bg-night min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        {/* Cabeçalho */}
        <div className="mb-8">
          <p className="font-body text-gold text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
            Fique por dentro
          </p>
          <h1 className="font-display text-fht-white text-4xl sm:text-5xl lg:text-6xl leading-none mb-4">
            NOTÍCIAS
          </h1>
          <div className="w-14 h-1 bg-gold" />
        </div>

        {/* Filtro por categoria */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['Todas', ...CATEGORIAS] as (NoticiaCategoria | 'Todas')[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFiltro(c)}
              className={`font-body text-sm px-4 py-2 rounded-full border transition-colors duration-150 ${
                filtro === c
                  ? 'text-gold bg-gold/10 border-gold/40'
                  : 'text-gray-soft bg-transparent border-federation/30 hover:border-federation/60'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="flex items-center justify-center gap-3 py-20">
            <Loader2 size={22} className="text-gold animate-spin" />
            <span className="font-body text-gray-soft text-sm">Carregando notícias...</span>
          </div>
        ) : erro ? (
          <div className="border border-federation/20 rounded-lg p-16 text-center flex flex-col items-center gap-3">
            <Newspaper size={40} className="text-gray-soft/40" />
            <p className="font-body text-gray-soft text-sm">Não foi possível carregar as notícias agora.</p>
            <button onClick={carregar} className="inline-flex items-center gap-2 font-body text-gold hover:text-gold-light text-sm">
              <RotateCw size={15} /> Tentar novamente
            </button>
          </div>
        ) : lista.length === 0 ? (
          <div className="border border-federation/20 rounded-lg p-16 text-center">
            <Newspaper size={40} className="text-gray-soft/40 mx-auto mb-4" />
            <p className="font-body text-gray-soft text-sm">
              {noticias.length === 0
                ? 'Ainda não há notícias publicadas. Volte em breve!'
                : 'Nenhuma notícia nesta categoria.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lista.map((n) => (
              <Link
                key={n.id}
                to={`/noticias/${n.slug}`}
                className="bg-section-alt/60 border border-federation/20 rounded-lg overflow-hidden hover:border-gold/40 transition-colors duration-250 group flex flex-col"
              >
                <div className="h-44 overflow-hidden">
                  <SafeImage
                    src={n.imagemCapaUrl}
                    alt={n.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackClassName={`bg-gradient-to-br ${categoryGradient[n.categoria] ?? 'from-federation to-night'}`}
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full self-start ${categoryColors[n.categoria]}`}>
                    {n.categoria}
                  </span>
                  <h2 className="font-display text-fht-white text-xl leading-tight mt-2 group-hover:text-gold transition-colors duration-250 line-clamp-2">
                    {n.titulo}
                  </h2>
                  {n.resumo && (
                    <p className="font-body text-gray-soft text-sm mt-2 line-clamp-2">{n.resumo}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-soft text-xs mt-3 pt-3 border-t border-federation/10">
                    <Calendar size={12} />
                    {formatDate(n.dataPublicacao)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
