import { useEffect, useState } from 'react'
import { Loader2, ImageIcon, RotateCw } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { apiGet } from '../services/api'
import SafeImage from './SafeImage'
import type { FotoDTO } from '../types/api'

/** Um bloco do mosaico com legenda sempre visível. */
function Tile({ foto, className }: { foto: FotoDTO; className?: string }) {
  return (
    <div className={`relative rounded-lg overflow-hidden group ${className ?? ''}`}>
      <SafeImage
        src={foto.imagemUrl}
        alt={foto.evento}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* gradiente + legenda sempre visíveis */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night via-night/50 to-transparent p-3 pt-10">
        <p className="font-display text-fht-white text-base leading-tight">
          {foto.evento} {foto.ano && <span className="text-gold">{foto.ano}</span>}
        </p>
        {foto.categoria && (
          <p className="font-body text-gray-soft text-xs mt-0.5">{foto.categoria}</p>
        )}
      </div>
    </div>
  )
}

export default function Gallery() {
  const ref = useInView()
  const [fotos, setFotos] = useState<FotoDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  function carregar() {
    setCarregando(true)
    setErro(false)
    apiGet<FotoDTO[]>('/api/galeria')
      .then(setFotos)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const large = fotos.filter((p) => p.tamanho === 'large')
  const medium = fotos.filter((p) => p.tamanho === 'medium')
  const small = fotos.filter((p) => p.tamanho === 'small')

  return (
    <section id="galeria" className="py-20 bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-12">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">História em imagens</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">MOMENTOS QUE FICAM</h2>
          <div className="w-16 h-1 bg-gold" />
        </div>

        {carregando ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 size={22} className="text-gold animate-spin" />
            <span className="font-body text-gray-soft text-sm">Carregando galeria...</span>
          </div>
        ) : erro ? (
          <div className="border border-federation/20 rounded-lg p-12 text-center flex flex-col items-center gap-3">
            <p className="font-body text-gray-soft text-sm">Não foi possível carregar a galeria agora.</p>
            <button onClick={carregar} className="inline-flex items-center gap-2 font-body text-gold hover:text-gold-light text-sm">
              <RotateCw size={15} /> Tentar novamente
            </button>
          </div>
        ) : fotos.length === 0 ? (
          <div className="border border-federation/20 rounded-lg p-12 text-center flex flex-col items-center gap-3">
            <ImageIcon size={36} className="text-gray-soft/40" />
            <p className="font-body text-gray-soft text-sm">Em breve, os melhores momentos do handebol tocantinense aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {large.map((foto) => (
              <Tile key={foto.id} foto={foto} className="col-span-2 row-span-2 aspect-[4/3]" />
            ))}
            {medium.map((foto) => (
              <Tile key={foto.id} foto={foto} className="aspect-square" />
            ))}
            {small.map((foto) => (
              <Tile key={foto.id} foto={foto} className="aspect-square" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
