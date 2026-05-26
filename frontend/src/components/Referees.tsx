import { useState } from 'react'
import { Star, Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import { referees, refereeCourses } from '../data/referees'
import { useInView } from '../hooks/useInView'
import ArbitroForm from './ArbitroForm'

const levelColors: Record<string, string> = {
  'Nacional': 'text-gold border-gold/40 bg-gold/10',
  'Estadual A': 'text-blue-300 border-blue-400/40 bg-blue-mid/10',
  'Estadual B': 'text-green-400 border-green-500/40 bg-green-500/10',
  'Regional': 'text-gray-soft border-gray-soft/30 bg-gray-soft/10',
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('')
}

export default function Referees() {
  const ref = useInView()
  const [showForm, setShowForm] = useState(false)

  return (
    <>
    <section id="arbitros" className="py-20 bg-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-12">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">Corpo arbitral</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">ARBITRAGEM OFICIAL</h2>
          <div className="w-16 h-1 bg-gold" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Árbitros credenciados */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-fht-white text-3xl leading-none mb-6">ÁRBITROS CREDENCIADOS</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {referees.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center gap-4 bg-night/50 border border-federation/20 rounded-lg p-4 hover:border-gold/40 transition-colors duration-250 group"
                >
                  <div className="w-12 h-12 bg-federation/30 rounded-lg flex items-center justify-center flex-shrink-0 border border-federation/30 group-hover:border-gold/40 transition-colors duration-250">
                    {ref.photo ? (
                      <img src={ref.photo} alt={ref.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="font-display text-gold text-lg">{getInitials(ref.name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-fht-white text-lg leading-tight uppercase truncate">{ref.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`font-body text-xs px-2 py-0.5 rounded-full border ${levelColors[ref.level]}`}>
                        {ref.level}
                      </span>
                      <span className="font-body text-gray-soft text-xs flex items-center gap-1">
                        <MapPin size={10} /> {ref.city}
                      </span>
                    </div>
                  </div>
                  <Star size={14} className="text-gold/50 group-hover:text-gold flex-shrink-0 transition-colors duration-250" />
                </div>
              ))}
            </div>
          </div>

          {/* Torne-se árbitro */}
          <div>
            <h3 className="font-display text-fht-white text-3xl leading-none mb-6">TORNE-SE ÁRBITRO</h3>
            <div className="bg-gradient-to-br from-federation/20 to-night border border-federation/30 rounded-lg p-6 mb-4">
              <p className="font-body text-gray-soft text-sm leading-relaxed mb-4">
                A FHT oferece cursos de formação para novos árbitros em parceria com a CBHb. Sem taxa de inscrição. Aberto para maiores de 18 anos com conhecimento das regras do handebol.
              </p>
              <ul className="flex flex-col gap-2 mb-6">
                {['Maior de 18 anos', 'Ensino médio completo', 'Conhecimento das regras básicas', 'Disponibilidade nos fins de semana'].map((req) => (
                  <li key={req} className="flex items-center gap-2 font-body text-fht-white text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 font-display text-night bg-gold hover:bg-gold-light py-3 rounded-lg tracking-wider transition-colors duration-250 w-full"
              >
                QUERO SER ÁRBITRO <ArrowRight size={16} />
              </button>
            </div>

            {/* Próximos cursos */}
            <h4 className="font-display text-fht-white text-xl mb-3">PRÓXIMOS CURSOS</h4>
            <div className="flex flex-col gap-3">
              {refereeCourses.map((course) => (
                <a
                  key={course.id}
                  href={course.registrationLink}
                  className="bg-night/60 border border-federation/20 rounded-lg p-4 hover:border-gold/40 transition-colors duration-250 group block"
                >
                  <p className="font-display text-fht-white text-base leading-tight group-hover:text-gold transition-colors duration-250 mb-2">{course.title}</p>
                  <div className="flex flex-col gap-1 text-xs text-gray-soft font-body">
                    <span className="flex items-center gap-1.5"><Calendar size={11} /> {new Date(course.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={11} /> {course.location}</span>
                    <span className="flex items-center gap-1.5"><Users size={11} /> {course.spots} vagas</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    {showForm && <ArbitroForm onClose={() => setShowForm(false)} />}
    </>
  )
}
