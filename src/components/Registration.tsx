import { User, Shield, CheckCircle } from 'lucide-react'
import { useInView } from '../hooks/useInView'

const athleteBenefits = [
  'Participar de competições oficiais da FHT',
  'Registro oficial no sistema nacional CBHb',
  'Carteirinha digital do atleta',
  'Seguro esportivo durante competições',
]

const clubBenefits = [
  'Filiação oficial à FHT e CBHb',
  'Acesso ao sistema de gestão de competições',
  'Inscrição em todos os torneios oficiais',
  'Suporte técnico e institucional da federação',
]

export default function Registration() {
  const ref = useInView()

  return (
    <section id="cadastro" className="py-20 bg-section-alt diagonal-texture relative overflow-hidden">
      {/* Glow decorativo */}
      <div className="absolute inset-0 bg-federation/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready text-center mb-14">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">Portal do Atleta e do Clube</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">
            FAÇA PARTE DO HANDEBOL DO TOCANTINS
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Atleta */}
          <div className="bg-night/60 border border-federation/30 rounded-lg p-8 hover:border-gold/40 transition-all duration-250 group flex flex-col">
            <div className="w-14 h-14 bg-federation/20 border border-federation/40 rounded-lg flex items-center justify-center mb-6 group-hover:border-gold/40 transition-colors duration-250">
              <User size={28} className="text-gold" />
            </div>
            <h3 className="font-display text-fht-white text-3xl leading-none mb-2">CADASTRO DE ATLETA</h3>
            <p className="font-body text-gray-soft text-sm mb-6 leading-relaxed">
              Registre-se oficialmente no sistema da FHT e tenha acesso a competições, transferências e histórico esportivo.
            </p>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {athleteBenefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-body text-fht-white text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
            <a
              href="#contato"
              className="font-display text-night bg-gold hover:bg-gold-light text-center py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20"
            >
              CADASTRAR ATLETA
            </a>
          </div>

          {/* Card Clube */}
          <div className="bg-night/60 border border-federation/30 rounded-lg p-8 hover:border-gold/40 transition-all duration-250 group flex flex-col">
            <div className="w-14 h-14 bg-federation/20 border border-federation/40 rounded-lg flex items-center justify-center mb-6 group-hover:border-gold/40 transition-colors duration-250">
              <Shield size={28} className="text-gold" />
            </div>
            <h3 className="font-display text-fht-white text-3xl leading-none mb-2">CADASTRAR CLUBE/EQUIPE</h3>
            <p className="font-body text-gray-soft text-sm mb-6 leading-relaxed">
              Filie seu clube à FHT e tenha acesso a todos os torneios oficiais, suporte técnico e reconhecimento institucional.
            </p>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {clubBenefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-body text-fht-white text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
            <a
              href="#contato"
              className="font-display text-fht-white border-2 border-fht-white/40 hover:border-gold hover:text-gold text-center py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250"
            >
              CADASTRAR CLUBE
            </a>
          </div>
        </div>

        <p className="font-body text-gray-soft text-xs text-center mt-8">
          Cadastro gratuito · Dados protegidos pela{' '}
          <span className="text-fht-white">LGPD — Lei Geral de Proteção de Dados</span>
        </p>
      </div>
    </section>
  )
}
