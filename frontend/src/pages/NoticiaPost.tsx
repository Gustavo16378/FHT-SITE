import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, User, ArrowLeft, Loader2, Newspaper } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiGet, fileUrl, ApiError } from '../services/api'
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
    month: 'long',
    year: 'numeric',
  })
}

export default function NoticiaPost() {
  const { slug } = useParams<{ slug: string }>()
  const [noticia, setNoticia] = useState<NoticiaDTO | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrada, setNaoEncontrada] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setCarregando(true)
    setNaoEncontrada(false)
    apiGet<NoticiaDTO>(`/api/noticias/${slug}`)
      .then(setNoticia)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNaoEncontrada(true)
        else setNaoEncontrada(true)
      })
      .finally(() => setCarregando(false))
  }, [slug])

  return (
    <div className="bg-night min-h-screen">
      <Navbar />
      <main className="pt-20 pb-20">
        {carregando ? (
          <div className="flex items-center justify-center gap-3 py-32">
            <Loader2 size={22} className="text-gold animate-spin" />
            <span className="font-body text-gray-soft text-sm">Carregando...</span>
          </div>
        ) : naoEncontrada || !noticia ? (
          <div className="max-w-3xl mx-auto px-4 text-center py-32">
            <Newspaper size={44} className="text-gray-soft/40 mx-auto mb-4" />
            <h1 className="font-display text-fht-white text-3xl mb-2">Notícia não encontrada</h1>
            <p className="font-body text-gray-soft text-sm mb-6">
              A notícia que você procura não existe ou não está mais publicada.
            </p>
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-6 py-3 rounded-lg text-sm tracking-wider transition-colors duration-250"
            >
              <ArrowLeft size={16} /> VER TODAS AS NOTÍCIAS
            </Link>
          </div>
        ) : (
          <article>
            {/* Capa */}
            <div className="relative h-64 sm:h-80 lg:h-[26rem] w-full overflow-hidden">
              {noticia.imagemCapaUrl ? (
                <img
                  src={fileUrl(noticia.imagemCapaUrl)}
                  alt={noticia.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${categoryGradient[noticia.categoria] ?? 'from-federation to-night'}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
            </div>

            {/* Conteúdo */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-24 relative">
              <Link
                to="/noticias"
                className="inline-flex items-center gap-1.5 font-body text-gray-soft hover:text-gold text-sm mb-4 transition-colors duration-150"
              >
                <ArrowLeft size={15} /> Todas as notícias
              </Link>

              <span className={`font-body text-xs font-semibold px-3 py-1 rounded-full inline-block ${categoryColors[noticia.categoria]}`}>
                {noticia.categoria}
              </span>

              <h1 className="font-display text-fht-white text-3xl sm:text-4xl lg:text-5xl leading-tight mt-3 mb-4">
                {noticia.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-soft text-sm pb-6 mb-6 border-b border-federation/20">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> {formatDate(noticia.dataPublicacao)}
                </span>
                {noticia.autorNome && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} /> {noticia.autorNome}
                  </span>
                )}
              </div>

              {noticia.resumo && (
                <p className="font-body text-fht-white/90 text-lg leading-relaxed mb-6">
                  {noticia.resumo}
                </p>
              )}

              <div className="font-body text-gray-soft text-base leading-relaxed whitespace-pre-wrap">
                {noticia.conteudo}
              </div>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  )
}
