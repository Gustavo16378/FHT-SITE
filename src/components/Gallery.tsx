import { gallery } from '../data/gallery'
import { useInView } from '../hooks/useInView'

export default function Gallery() {
  const ref = useInView()

  const large = gallery.filter((p) => p.size === 'large')
  const medium = gallery.filter((p) => p.size === 'medium')
  const small = gallery.filter((p) => p.size === 'small')

  return (
    <section id="galeria" className="py-20 bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-12">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">História em imagens</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">MOMENTOS QUE FICAM</h2>
          <div className="w-16 h-1 bg-gold" />
        </div>

        {/* Mosaic grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {/* Large photos — span 2 cols */}
          {large.map((photo) => (
            <div
              key={photo.id}
              className="col-span-2 row-span-2 relative rounded-lg overflow-hidden group cursor-pointer aspect-[4/3]"
            >
              <img
                src={photo.src}
                alt={photo.event}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="font-display text-gold text-xl leading-tight">{photo.event}</p>
                <p className="font-body text-gray-soft text-xs">{photo.category} · {photo.year}</p>
              </div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}

          {/* Medium photos */}
          {medium.map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-lg overflow-hidden group cursor-pointer aspect-square"
            >
              <img
                src={photo.src}
                alt={photo.event}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="font-display text-fht-white text-base leading-tight">{photo.event}</p>
                <p className="font-body text-gray-soft text-xs">{photo.year}</p>
              </div>
            </div>
          ))}

          {/* Small photos */}
          {small.map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-lg overflow-hidden group cursor-pointer aspect-square"
            >
              <img
                src={photo.src}
                alt={photo.event}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-display text-fht-white text-sm leading-tight">{photo.event} · {photo.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
