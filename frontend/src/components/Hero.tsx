import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { apiGet } from '../services/api'
import type { ArbitroPublicoDTO, ClubeVitrineDTO, CompeticaoPublicaDTO } from '../types/api'

/** Rótulos fixos; os números vêm das APIs públicas — nada de contagem inventada aqui. */
const STAT_LABELS = ['Clubes Filiados', 'Atletas Cadastrados', 'Competições Ativas', 'Árbitros Credenciados']

const STATUS_LABEL: Partial<Record<CompeticaoPublicaDTO['status'], string>> = {
  INSCRICOES_ABERTAS: 'Inscrições Abertas',
  EM_ANDAMENTO: 'Em Andamento',
  EM_BREVE: 'Em Breve',
}

/**
 * A competição em destaque: a que está com inscrições abertas ou em andamento;
 * na falta das duas, a próxima que ainda vai começar.
 */
function competicaoDestaque(comps: CompeticaoPublicaDTO[]): CompeticaoPublicaDTO | null {
  const emCurso = comps
    .filter(c => c.status === 'INSCRICOES_ABERTAS' || c.status === 'EM_ANDAMENTO')
    .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
  if (emCurso.length > 0) return emCurso[0]

  const hoje = new Date().toISOString().slice(0, 10)
  const futuras = comps
    .filter(c => c.status === 'EM_BREVE' && c.dataInicio >= hoje)
    .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
  return futuras[0] ?? null
}

export default function Hero() {
  const [visible, setVisible] = useState(false)
  const [stats, setStats] = useState<(number | null)[]>([null, null, null, null])
  const [destaque, setDestaque] = useState<CompeticaoPublicaDTO | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let ativo = true
    // Cada número tem sua própria fonte: se uma API falhar, as outras continuam valendo.
    // Falha vira `null` (renderiza "—"), nunca 0 — senão o site anunciaria a federação zerada.
    const clubesP = apiGet<ClubeVitrineDTO[]>('/api/clubes/publico').catch(() => null)
    const compsP = apiGet<CompeticaoPublicaDTO[]>('/api/competicoes/publico').catch(() => null)
    const arbitrosP = apiGet<ArbitroPublicoDTO[]>('/api/arbitros/publico').catch(() => null)

    Promise.all([clubesP, compsP, arbitrosP]).then(([clubes, competicoes, arbitros]) => {
      if (!ativo) return
      setStats([
        clubes && clubes.length,
        clubes && clubes.reduce((soma, c) => soma + (c.totalAtletas ?? 0), 0),
        competicoes && competicoes.filter(c => c.status === 'EM_ANDAMENTO' || c.status === 'INSCRICOES_ABERTAS').length,
        arbitros && arbitros.length,
      ])
      if (competicoes) setDestaque(competicaoDestaque(competicoes))
    }).catch(() => { /* já tratado por fonte */ })
    return () => { ativo = false }
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-night"
    >
      {/* Glows — radial-gradient evita camada de GPU do blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(26,58,143,0.22) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(26,58,143,0.12) 0%, transparent 70%)' }} />

      {/* Linha amarela decorativa */}
      <div className="absolute left-0 top-1/3 w-1 h-24 sm:h-32 bg-gold" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-10 sm:pb-20">

        {/* Badge da competição em destaque — some quando não há nenhuma cadastrada */}
        {destaque && (
          <a
            href="#competicoes"
            className={`inline-flex flex-wrap items-center gap-2 bg-federation/30 border border-federation/50 hover:border-gold/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-8 transition-[opacity,transform,border-color] duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse flex-shrink-0" />
            <span className="font-body text-gray-soft text-xs sm:text-sm">
              {destaque.status === 'EM_ANDAMENTO' ? 'Acontecendo agora:' : 'Próxima competição:'}
            </span>
            <span className="font-body text-fht-white text-xs sm:text-sm font-semibold">{destaque.nome}</span>
            <span className="font-body text-gold text-xs font-semibold border border-gold/40 rounded-full px-2 py-0.5 whitespace-nowrap">
              {STATUS_LABEL[destaque.status] ?? 'Confira'}
            </span>
          </a>
        )}

        {/* Título */}
        <h1
          className={`font-display text-fht-white text-[2.4rem] sm:text-7xl lg:text-8xl xl:text-9xl leading-none mb-3 sm:mb-6 transition-[opacity,transform] duration-700 delay-100 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          O HANDEBOL DO{' '}
          <span className="text-gold block">TOCANTINS</span>
          <span className="block">COMEÇA AQUI</span>
        </h1>

        {/* Subtítulo */}
        <p
          className={`font-body text-gray-soft text-sm sm:text-lg lg:text-xl max-w-2xl mb-5 sm:mb-10 leading-relaxed transition-[opacity,transform] duration-700 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Portal oficial de cadastros, competições e desenvolvimento do handebol no estado do Tocantins.
          Filiada à CBHb — Confederação Brasileira de Handebol.
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-col sm:flex-row gap-2.5 sm:gap-4 mb-8 sm:mb-16 transition-[opacity,transform] duration-700 delay-300 ${
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
          className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 transition-[opacity,transform] duration-700 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {STAT_LABELS.map((label, i) => (
            <div key={label} className="border-l-2 border-gold/50 pl-4">
              <p className="font-display text-gold text-3xl sm:text-5xl leading-none">
                {stats[i] ?? '—'}
              </p>
              <p className="font-body text-gray-soft text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll down */}
      <a
        href="#competicoes"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-soft hover:text-gold transition-colors duration-250 opacity-60"
        aria-label="Role para baixo"
      >
        <ChevronDown size={26} />
      </a>
    </section>
  )
}
