import { Trophy, Compass, Shield, FileText, Download } from 'lucide-react'
import { directors } from '../data/directors'
import { documents } from '../data/documents'
import { useInView } from '../hooks/useInView'

const mvv = [
  {
    icon: Trophy,
    title: 'MISSÃO',
    text: 'Desenvolver, organizar e promover o handebol no estado do Tocantins em todas as categorias, formando atletas e fortalecendo clubes.',
  },
  {
    icon: Compass,
    title: 'VISÃO',
    text: 'Ser referência nacional no desenvolvimento do handebol, colocando o Tocantins entre os estados de maior produção esportiva do Brasil.',
  },
  {
    icon: Shield,
    title: 'VALORES',
    text: 'Ética, transparência, inclusão social, excelência esportiva e respeito às regras do esporte e de seus praticantes.',
  },
]

const institutionalDocs = documents.filter((d) => d.category === 'Estatuto').slice(0, 3)

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('')
}

export default function About() {
  const ref = useInView()

  return (
    <section id="sobre" className="py-20 bg-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-14">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">Quem somos</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">
            GOVERNANDO E DESENVOLVENDO O<br className="hidden sm:block" />{' '}
            <span className="text-gold">HANDEBOL TOCANTINENSE</span>
          </h2>
          <div className="w-16 h-1 bg-gold mb-8" />
          <div className="max-w-3xl">
            <p className="font-body text-gray-soft text-lg leading-relaxed mb-4">
              A <strong className="text-fht-white">FHT — Federação de Handebol do Tocantins</strong> é a entidade oficial que regula,
              organiza e desenvolve o handebol em todo o estado do Tocantins. Filiada à{' '}
              <strong className="text-fht-white">CBHb — Confederação Brasileira de Handebol</strong>, a FHT é responsável
              pelas competições estaduais, credenciamento de árbitros, registro de atletas e filiação de clubes.
            </p>
            <p className="font-body text-gray-soft leading-relaxed">
              Com sede em Palmas, a federação atua em todo o estado promovendo o esporte em todas as categorias de base e adulto,
              com foco no desenvolvimento humano e na formação de atletas de alta performance.
            </p>
          </div>
        </div>

        {/* Missão, Visão e Valores */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {mvv.map((item) => (
            <div
              key={item.title}
              className="bg-night/50 border border-federation/20 rounded-lg p-6 hover:border-gold/30 transition-colors duration-250 group"
            >
              <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-lg flex items-center justify-center mb-4 group-hover:border-gold/50 transition-colors duration-250">
                <item.icon size={20} className="text-gold" />
              </div>
              <h3 className="font-display text-gold text-2xl leading-none mb-3">{item.title}</h3>
              <p className="font-body text-gray-soft text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Diretoria */}
        <div className="mb-20">
          <h3 className="font-display text-fht-white text-4xl leading-none mb-2">DIRETORIA</h3>
          <div className="w-10 h-0.5 bg-gold mb-8" />
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {directors.map((dir) => (
              <div key={dir.id} className="group text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-lg bg-federation/30 border border-federation/30 group-hover:border-gold/50 transition-colors duration-250 flex items-center justify-center mb-2 overflow-hidden">
                  {dir.photo ? (
                    <img
                      src={dir.photo}
                      alt={dir.name}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <span className="font-display text-gold text-xl sm:text-2xl">{getInitials(dir.name)}</span>
                  )}
                </div>
                <p className="font-display text-fht-white text-xs sm:text-sm leading-tight uppercase line-clamp-2">{dir.name}</p>
                <p className="font-body text-gray-soft text-xs mt-1 truncate">{dir.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos institucionais */}
        <div>
          <h3 className="font-display text-fht-white text-4xl leading-none mb-2">DOCUMENTOS INSTITUCIONAIS</h3>
          <div className="w-10 h-0.5 bg-gold mb-8" />
          <div className="flex flex-col gap-3">
            {institutionalDocs.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-night/50 border border-federation/20 rounded-lg px-5 py-4 hover:border-gold/40 transition-colors duration-250 group"
              >
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-250">
                  <FileText size={18} className="text-gold" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-fht-white text-sm font-semibold group-hover:text-gold transition-colors duration-250">{doc.title}</p>
                  <p className="font-body text-gray-soft text-xs mt-0.5">
                    Publicado em {new Date(doc.publishedAt + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Download size={16} className="text-gray-soft group-hover:text-gold transition-colors duration-250 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
