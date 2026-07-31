import { useEffect, useState } from 'react'
import { MapPin, Users, Calendar, ChevronRight, AlertCircle, Trophy } from 'lucide-react'
import { apiGet } from '../services/api'
import type { CompeticaoPublicaDTO, CompeticaoStatus } from '../types/api'
import { useInView } from '../hooks/useInView'

// Os 6 status possíveis precisam estar aqui: se faltar um, o badge renderiza vazio
// (foi o que acontecia quando a lista era estática e só previa 4).
const statusLabels: Record<CompeticaoStatus, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  INSCRICOES_ABERTAS: 'Inscrições Abertas',
  EM_BREVE: 'Em Breve',
  ENCERRADO: 'Encerrado',
  ADIADO: 'Adiado',
  CANCELADO: 'Cancelado',
}

const statusColors: Record<CompeticaoStatus, string> = {
  EM_ANDAMENTO: 'bg-green-500/20 text-green-400 border-green-500/40',
  INSCRICOES_ABERTAS: 'bg-gold/20 text-gold border-gold/40',
  EM_BREVE: 'bg-blue-mid/20 text-blue-300 border-blue-400/40',
  ENCERRADO: 'bg-gray-soft/10 text-gray-soft border-gray-soft/30',
  ADIADO: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  CANCELADO: 'bg-red-500/20 text-red-400 border-red-500/40',
}

const statusFilters: { label: string; value: CompeticaoStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Em andamento', value: 'EM_ANDAMENTO' },
  { label: 'Inscrições abertas', value: 'INSCRICOES_ABERTAS' },
  { label: 'Em breve', value: 'EM_BREVE' },
  { label: 'Adiados', value: 'ADIADO' },
  { label: 'Encerrados', value: 'ENCERRADO' },
]

// Precisa espelhar CATEGORIAS_VALIDAS do backend — categoria que o admin cadastra e não está
// aqui vira competição invisível ao filtro.
const categoryFilters = ['Todos', 'Adulto', 'Sub-18', 'Sub-16', 'Sub-14', 'Sub-12', 'Master', 'Feminino', 'Masculino']

function formatDate(dateStr: string) {
  // O backend manda LocalDate ("2026-04-10"), mas aceitar ISO com hora evita quebrar
  // caso algum campo vire datetime depois.
  const iso = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function localCompleto(comp: CompeticaoPublicaDTO): string {
  const cidadeUf = [comp.cidade, comp.uf].filter(Boolean).join(', ')
  return [comp.local, cidadeUf].filter(Boolean).join(' — ') || 'Local a definir'
}

function CompetitionCTA({ comp }: { comp: CompeticaoPublicaDTO }) {
  if (comp.status === 'ENCERRADO' || comp.status === 'CANCELADO') {
    return (
      <span className="inline-block font-body text-gray-soft text-xs border border-gray-soft/20 px-3 py-1.5 rounded-lg">
        {statusLabels[comp.status]}
      </span>
    )
  }
  if (comp.status === 'INSCRICOES_ABERTAS') {
    // Sem link cadastrado, o clube se inscreve pelo painel — mandar pro login é mais útil
    // do que esconder o botão.
    return (
      <a
        href={comp.linkInscricao || '/login'}
        className="inline-flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-4 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 w-full sm:w-auto justify-center"
      >
        INSCREVER EQUIPE <ChevronRight size={15} />
      </a>
    )
  }
  if (comp.status === 'EM_BREVE' || comp.status === 'ADIADO') {
    return (
      <span className="inline-block font-display text-blue-300 text-xs border border-blue-400/40 bg-blue-mid/10 px-3 py-1.5 rounded-lg tracking-wider">
        {statusLabels[comp.status].toUpperCase()}
      </span>
    )
  }
  return (
    <span className="inline-block font-display text-green-400 text-xs border border-green-500/30 bg-green-500/10 px-3 py-1.5 rounded-lg tracking-wider">
      EM ANDAMENTO
    </span>
  )
}

export default function Competitions() {
  const ref = useInView()
  const [activeStatus, setActiveStatus] = useState<CompeticaoStatus | 'todos'>('todos')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [competicoes, setCompeticoes] = useState<CompeticaoPublicaDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let ativo = true
    apiGet<CompeticaoPublicaDTO[]>('/api/competicoes/publico')
      .then(data => { if (ativo) { setCompeticoes(data); setErro(false) } })
      .catch(() => { if (ativo) setErro(true) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  const filtered = competicoes.filter(c => {
    const statusOk = activeStatus === 'todos' || c.status === activeStatus
    const categoryOk =
      activeCategory === 'Todos' || c.categorias.some(cat => cat === activeCategory.toLowerCase())
    return statusOk && categoryOk
  })

  // A temporada em destaque é a da competição mais recente; sem nada cadastrado, o ano corrente.
  const temporada = competicoes.length > 0
    ? Math.max(...competicoes.map(c => c.temporada))
    : new Date().getFullYear()

  return (
    <section id="competicoes" className="py-16 sm:py-20 bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-8 sm:mb-12">
          <p className="font-body text-gold text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
            Temporada {temporada}
          </p>
          <h2 className="font-display text-fht-white text-4xl sm:text-5xl lg:text-6xl leading-none mb-4">
            COMPETIÇÕES
          </h2>
          <div className="w-14 h-1 bg-gold" />
        </div>

        {/* Filtros status — scroll horizontal sem scrollbar visível */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto mb-3">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveStatus(f.value)}
              className={`font-body text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap border transition-colors duration-250 flex-shrink-0 ${
                activeStatus === f.value
                  ? 'bg-federation border-federation text-fht-white'
                  : 'bg-transparent border-gray-soft/20 text-gray-soft hover:border-gray-soft/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Filtros categoria */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 mb-6 sm:mb-8">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-body text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors duration-250 flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-gold border-gold text-night'
                  : 'bg-transparent border-gold/20 text-gray-soft hover:border-gold/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {carregando ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="bg-section-alt/70 border border-federation/20 rounded-lg h-32 animate-pulse" />
              ))}
            </div>
          ) : erro ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <AlertCircle size={28} className="text-gray-soft/60" />
              <p className="font-body text-gray-soft text-center">
                Não foi possível carregar as competições agora. Tente novamente mais tarde.
              </p>
            </div>
          ) : competicoes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Trophy size={28} className="text-gray-soft/60" />
              <p className="font-body text-gray-soft text-center">
                Nenhuma competição divulgada no momento. Fique de olho — o calendário da temporada sai por aqui.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="font-body text-gray-soft text-center py-12">
              Nenhuma competição encontrada com esses filtros.
            </p>
          ) : (
            filtered.map((comp) => (
              <div
                key={comp.id}
                className="bg-section-alt/70 border border-federation/20 rounded-lg overflow-hidden hover:border-federation/50 transition-colors duration-250 group"
              >
                {/* Barra colorida sempre à esquerda */}
                <div className="flex">
                  <div className="w-1 flex-shrink-0 self-stretch" style={{ backgroundColor: comp.cor }} />

                  <div className="flex-1 p-4 sm:p-5">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[comp.status]}`}>
                        {statusLabels[comp.status]}
                      </span>
                      {comp.categorias.map((cat) => (
                        <span
                          key={cat}
                          className="font-body text-xs text-gray-soft border border-gray-soft/20 px-1.5 py-0.5 rounded-full capitalize"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Nome */}
                    <h3 className="font-display text-fht-white text-xl sm:text-2xl lg:text-3xl leading-tight mb-3 group-hover:text-gold transition-colors duration-250">
                      {comp.nome}
                    </h3>

                    {/* Infos */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-4 text-gray-soft text-xs sm:text-sm font-body mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-gold flex-shrink-0" />
                        {formatDate(comp.dataInicio)} — {formatDate(comp.dataFim)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gold flex-shrink-0" />
                        {localCompleto(comp)}
                      </span>
                      {comp.numeroEquipes > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Users size={12} className="text-gold flex-shrink-0" />
                          {comp.numeroEquipes} {comp.numeroEquipes === 1 ? 'equipe' : 'equipes'}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <CompetitionCTA comp={comp} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="font-body text-gray-soft text-xs text-center mt-6">
          Inscrições via sistema oficial da FHT ·{' '}
          <a href="#contato" className="text-gold hover:underline">
            Dúvidas? Fale conosco
          </a>
        </p>
      </div>
    </section>
  )
}
