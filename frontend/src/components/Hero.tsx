import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const stats = [
  { value: '8', label: 'Clubes Filiados' },
  { value: '320+', label: 'Atletas Cadastrados' },
  { value: '4', label: 'Competições Ativas' },
  { value: '18', label: 'Árbitros Credenciados' },
]

const nextCompetition = {
  name: 'Copa FHT Sub-18 Feminino',
  status: 'Inscrições Abertas',
}

export default function Hero() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-night"
    >
      {/* Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-federation/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-federation/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Linha amarela decorativa */}
      <div className="absolute left-0 top-1/3 w-1 h-24 sm:h-32 bg-gold" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-10 sm:pb-20">

        {/* Badge próxima competição */}
        <div
          className={`inline-flex flex-wrap items-center gap-2 bg-federation/30 border border-federation/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-8 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse flex-shrink-0" />
          <span className="font-body text-gray-soft text-xs sm:text-sm">Próxima competição:</span>
          <span className="font-body text-fht-white text-xs sm:text-sm font-semibold">{nextCompetition.name}</span>
          <span className="font-body text-gold text-xs font-semibold border border-gold/40 rounded-full px-2 py-0.5 whitespace-nowrap">
            {nextCompetition.status}
          </span>
        </div>

        {/* Título */}
        <h1
          className={`font-display text-fht-white text-[2.4rem] sm:text-7xl lg:text-8xl xl:text-9xl leading-none mb-3 sm:mb-6 transition-all duration-700 delay-100 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          O HANDEBOL DO{' '}
          <span className="text-gold block">TOCANTINS</span>
          <span className="block">COMEÇA AQUI</span>
        </h1>

        {/* Subtítulo */}
        <p
          className={`font-body text-gray-soft text-sm sm:text-lg lg:text-xl max-w-2xl mb-5 sm:mb-10 leading-relaxed transition-all duration-700 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Portal oficial de cadastros, competições e desenvolvimento do handebol no estado do Tocantins.
          Filiada à CBHb — Confederação Brasileira de Handebol.
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-col sm:flex-row gap-2.5 sm:gap-4 mb-8 sm:mb-16 transition-all duration-700 delay-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <a
            href="#cadastro"
            className="font-display text-night bg-gold hover:bg-gold-light text-center px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-lg sm:text-xl tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20"
          >
            CADASTRAR ATLETA
          </a>
          <a
            href="#competicoes"
            className="font-display text-fht-white border-2 border-fht-white/30 hover:border-fht-white text-center px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-lg sm:text-xl tracking-wider transition-colors duration-250"
          >
            VER COMPETIÇÕES
          </a>
        </div>

        {/* Stats — sempre 2 colunas no mobile, 4 no desktop */}
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 transition-all duration-700 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat, i) => (
            <div key={i} className="border-l-2 border-gold/50 pl-4">
              <p className="font-display text-gold text-3xl sm:text-5xl leading-none">{stat.value}</p>
              <p className="font-body text-gray-soft text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll down */}
      <a
        href="#competicoes"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-soft hover:text-gold transition-colors duration-250 animate-bounce"
        aria-label="Role para baixo"
      >
        <ChevronDown size={26} />
      </a>
    </section>
  )
}
