import { useEffect, useState } from 'react'
import { MapPin, ArrowRight, X, Users, Loader2, Trophy, RotateCw } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { apiGet } from '../services/api'
import type { ClubeVitrineDTO, ClubeVitrineDetalheDTO } from '../types/api'

const bgColors = [
  'from-federation/30 to-blue-mid/20',
  'from-blue-mid/20 to-federation/10',
  'from-section-alt to-federation/20',
]

/** Sigla do escudo: usa a sigla do clube ou deriva das iniciais do nome. */
function iniciais(nome: string, sigla: string | null): string {
  if (sigla && sigla.trim()) return sigla.trim().toUpperCase()
  return nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 3)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function ModalClube({ id, onClose }: { id: string; onClose: () => void }) {
  const [detalhe, setDetalhe] = useState<ClubeVitrineDetalheDTO | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    apiGet<ClubeVitrineDetalheDTO>(`/api/clubes/publico/${id}`)
      .then(setDetalhe)
      .catch(() => setDetalhe(null))
      .finally(() => setCarregando(false))
  }, [id])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {carregando ? (
          <div className="flex items-center justify-center gap-3 py-20">
            <Loader2 size={22} className="text-gold animate-spin" />
            <span className="font-body text-gray-soft text-sm">Carregando...</span>
          </div>
        ) : !detalhe ? (
          <div className="p-8 text-center">
            <p className="font-body text-gray-soft text-sm">Não foi possível carregar o clube.</p>
            <button onClick={onClose} className="mt-4 font-display text-gold text-sm tracking-wider">FECHAR</button>
          </div>
        ) : (
          <>
            {/* header */}
            <div className="p-5 border-b border-federation/20 flex items-start justify-between sticky top-0 bg-[#0a1628] z-10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-federation/40 border border-gold/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-gold text-xl">{iniciais(detalhe.nome, detalhe.sigla)}</span>
                </div>
                <div>
                  <h3 className="font-display text-fht-white text-2xl leading-tight">{detalhe.nome}</h3>
                  <p className="font-body text-gray-soft text-sm flex items-center gap-1">
                    <MapPin size={12} /> {detalhe.cidade}/{detalhe.uf}
                  </p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Fechar" className="text-gray-soft hover:text-fht-white transition-colors duration-150">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* categorias */}
              {detalhe.categorias.length > 0 && (
                <div>
                  <p className="font-display text-gold text-xs tracking-widest mb-2">CATEGORIAS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detalhe.categorias.map((cat) => (
                      <span key={cat} className="font-body text-xs text-gray-soft border border-gray-soft/20 px-2 py-0.5 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* elenco */}
              <div>
                <p className="font-display text-gold text-xs tracking-widest mb-2 flex items-center gap-1.5">
                  <Users size={13} /> ELENCO ({detalhe.totalAtletas})
                </p>
                {detalhe.atletas.length === 0 ? (
                  <p className="font-body text-gray-soft text-sm">Nenhum atleta ativo cadastrado ainda.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-federation/10 border border-federation/15 rounded-lg overflow-hidden">
                    {detalhe.atletas.map((a, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#0d1b2a]/40">
                        <span className="font-body text-fht-white text-sm">{a.nome}</span>
                        <span className="font-body text-gray-soft text-xs">{a.posicao} · {a.categoria}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* competições — depende do módulo de Competições */}
              <div className="bg-[#0d1b2a]/40 border border-federation/15 rounded-lg p-4 flex items-center gap-3">
                <Trophy size={18} className="text-gold/60 flex-shrink-0" />
                <p className="font-body text-gray-soft text-xs">
                  O histórico de competições disputadas aparece aqui quando o módulo de competições for lançado.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Clubs() {
  const ref = useInView()
  const [clubes, setClubes] = useState<ClubeVitrineDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [modalId, setModalId] = useState<string | null>(null)

  function carregar() {
    setCarregando(true)
    setErro(false)
    apiGet<ClubeVitrineDTO[]>('/api/clubes/publico')
      .then(setClubes)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  return (
    <section id="clubes" className="py-20 bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-12">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">Ecossistema</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">
            CLUBES QUE FAZEM O<br className="hidden sm:block" />{' '}
            <span className="text-gold">HANDEBOL ACONTECER</span>
          </h2>
          <div className="w-16 h-1 bg-gold" />
        </div>

        {carregando ? (
          <div className="flex items-center justify-center gap-3 py-16 mb-10">
            <Loader2 size={22} className="text-gold animate-spin" />
            <span className="font-body text-gray-soft text-sm">Carregando clubes...</span>
          </div>
        ) : erro ? (
          <div className="border border-federation/20 rounded-lg p-10 text-center mb-10 flex flex-col items-center gap-3">
            <p className="font-body text-gray-soft text-sm">Não foi possível carregar os clubes agora.</p>
            <button onClick={carregar} className="inline-flex items-center gap-2 font-body text-gold hover:text-gold-light text-sm">
              <RotateCw size={15} /> Tentar novamente
            </button>
          </div>
        ) : clubes.length === 0 ? (
          <div className="border border-federation/20 rounded-lg p-10 text-center mb-10">
            <p className="font-body text-gray-soft text-sm">
              Em breve os clubes filiados aparecem aqui. Seja o primeiro — filie seu clube!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {clubes.map((club, i) => (
              <button
                key={club.id}
                type="button"
                onClick={() => setModalId(club.id)}
                className={`text-left bg-gradient-to-br ${bgColors[i % bgColors.length]} border border-federation/20 rounded-lg p-4 sm:p-5 hover:border-gold/50 transition-colors duration-250 group cursor-pointer overflow-hidden`}
              >
                <div className="w-12 h-12 bg-federation/40 border border-federation/50 rounded-lg flex items-center justify-center mb-3 group-hover:border-gold/50 transition-colors duration-250 flex-shrink-0">
                  <span className="font-display text-gold text-lg">{iniciais(club.nome, club.sigla)}</span>
                </div>

                <h3 className="font-display text-fht-white text-lg leading-tight group-hover:text-gold transition-colors duration-250 mb-1 line-clamp-2">
                  {club.nome}
                </h3>

                <div className="flex items-center gap-1 text-gray-soft text-xs mb-3 truncate">
                  <MapPin size={10} className="flex-shrink-0" />
                  <span className="truncate">{club.cidade}/{club.uf}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {club.categorias.slice(0, 3).map((cat) => (
                    <span key={cat} className="font-body text-xs text-gray-soft border border-gray-soft/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {cat}
                    </span>
                  ))}
                  {club.categorias.length === 0 && club.totalAtletas > 0 && (
                    <span className="font-body text-xs text-gray-soft/70">{club.totalAtletas} atletas</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="text-center">
          <a
            href="#contato"
            className="inline-flex items-center gap-2 font-display text-night bg-gold hover:bg-gold-light px-8 py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20"
          >
            FILIAR MEU CLUBE <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {modalId && <ModalClube id={modalId} onClose={() => setModalId(null)} />}
    </section>
  )
}
