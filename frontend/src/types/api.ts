// Tipos espelhando os DTOs do backend (br.org.fht.dto.*).
// Todas as respostas da API vêm embrulhadas em ApiResponse<T>.

export interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export type ClubeStatus = 'PENDENTE' | 'ATIVO' | 'REJEITADO' | 'SUSPENSO'
export type AtletaStatus = 'AGUARDANDO_PAGAMENTO' | 'AGUARDANDO_APROVACAO' | 'ATIVO' | 'REJEITADO' | 'SUSPENSO'

/** Finalidades de consentimento LGPD (uma por registro — art. 14, §1) */
export type FinalidadeConsentimento = 'CADASTRO_ATLETA_MENOR' | 'IMAGEM_PUBLICA'

/** ConsentimentoDTO */
export interface ConsentimentoDTO {
  id: string
  finalidade: FinalidadeConsentimento
  titularMenor: boolean
  consentidoPorNome: string | null
  consentidoPorCpf: string | null
  textoVersao: string
  concedidoEm: string
  revogadoEm: string | null
}

/** ClubeResponseDTO */
export interface ClubeDTO {
  id: string
  nome: string
  cidade: string
  uf: string
  sigla: string | null
  cnpj: string | null
  representanteNome: string
  representanteEmail: string
  representanteTelefone: string
  ataFundacaoUrl: string | null
  estatutoUrl: string | null
  status: ClubeStatus
  motivoRejeicao: string | null
  visivelNaHome: boolean
  createdAt: string
  updatedAt: string
}

/** ClubeVitrineDTO — card público da home (só dados públicos) */
export interface ClubeVitrineDTO {
  id: string
  nome: string
  cidade: string
  uf: string
  sigla: string | null
  categorias: string[]
  totalAtletas: number
}

/** AtletaVitrineDTO — atleta no modal público */
export interface AtletaVitrineDTO {
  nome: string
  posicao: string
  categoria: string
}

/** ClubeVitrineDetalheDTO — detalhe público do clube (modal) */
export interface ClubeVitrineDetalheDTO extends ClubeVitrineDTO {
  atletas: AtletaVitrineDTO[]
}

/** AtletaResponseDTO — sexo vem como string ("M"/"F" ou "Masculino"/"Feminino") */
export interface AtletaDTO {
  id: string
  clubeId: string
  nomeCompleto: string
  dataNascimento: string
  sexo: string
  cpf: string
  rg: string
  telefone: string | null
  email: string | null
  cidade: string | null
  ufResidencia: string | null
  posicao: string
  categoria: string
  transferencia: boolean
  clubeAnterior: string | null
  menorDeIdade: boolean
  responsavelNome: string | null
  responsavelCpf: string | null
  responsavelParentesco: string | null
  responsavelEmail: string | null
  responsavelTelefone: string | null
  fotoUrl: string | null
  rgUrl: string | null
  comprovanteResidenciaUrl: string | null
  comprovantePagamentoUrl: string | null
  status: AtletaStatus
  motivoRejeicao: string | null
  /** Prazo para anexar o comprovante — vencido, o cadastro é apagado */
  prazoPagamentoAte: string | null
  taxaValor: number | null
  taxaAno: number | null
  consentimentos: ConsentimentoDTO[]
  createdAt: string
}

/** GET /api/admin/dashboard */
export interface AdminDashboardDTO {
  clubes: { total: number; pendentes: number; ativos: number }
  /** `pendentes` = falta pagar + aguardando aprovação; `aguardandoAprovacao` é o subconjunto já pago */
  atletas: { total: number; pendentes: number; aguardandoAprovacao: number; ativos: number }
  usuarios: number
}

/** LoginResponseDTO */
export interface LoginResponse {
  token: string
  refreshToken: string | null
  role: 'ADMIN_FHT' | 'ADMIN_CLUBE'
}

export type NoticiaCategoria = 'Institucional' | 'Competição' | 'Arbitragem' | 'Seleção'
export type NoticiaStatus = 'RASCUNHO' | 'PUBLICADO'

/** NoticiaResumoDTO / NoticiaResponseDTO — `conteudo` só vem no detalhe (slug) e na listagem admin. */
export interface NoticiaDTO {
  id: string
  titulo: string
  slug: string
  categoria: NoticiaCategoria
  resumo: string | null
  conteudo?: string | null
  imagemCapaUrl: string | null
  autorNome: string | null
  dataPublicacao: string
  destaque: boolean
  status: NoticiaStatus
  createdAt: string
  updatedAt: string
}

/** Resposta dos endpoints de upload de imagem (notícias, galeria) */
export interface UploadResponse {
  url: string
}

/** DiretorDTO — membro da diretoria (institucional, público) */
export interface DiretorDTO {
  id: string
  nome: string
  cargo: string
  area: string | null
  mandato: string | null
  email: string | null
  telefone: string | null
  desde: string | null
  bio: string | null
  fotoUrl: string | null
  ordem: number
  createdAt: string
}

export type DocumentoCategoria = 'Estatuto' | 'Regulamento' | 'Calendário' | 'Edital' | 'Circular'

/** DocumentoDTO — documento institucional público (transparência) */
export interface DocumentoDTO {
  id: string
  titulo: string
  categoria: DocumentoCategoria
  arquivoUrl: string
  dataPublicacao: string
  publicadoPor: string | null
  tamanhoBytes: number | null
  createdAt: string
}

/** POST /api/documentos/upload-arquivo */
export interface DocumentoUploadResponse {
  url: string
  tamanhoBytes: number
}

export type ArbitroStatus = 'PENDENTE' | 'CREDENCIADO' | 'REJEITADO' | 'SUSPENSO'

/** ArbitroResponseDTO — visão completa (admin) */
export interface ArbitroDTO {
  id: string
  nome: string
  cpf: string | null
  rg: string | null
  orgaoEmissor: string | null
  dataNascimento: string | null
  sexo: string | null
  telefone: string | null
  email: string | null
  cidade: string | null
  uf: string | null
  fotoUrl: string | null
  rgUrl: string | null
  comprovanteEscolarUrl: string | null
  jaArbitro: boolean
  nivelAtual: string | null
  federacaoOrigem: string | null
  temExperiencia: boolean
  descricaoExperiencia: string | null
  disponibilidadeFds: boolean
  cursoInteresse: string | null
  nivel: string | null
  registro: string | null
  inicioArbitragem: string | null
  formacao: string | null
  status: ArbitroStatus
  motivoRejeicao: string | null
  createdAt: string
}

/** ArbitroPublicoDTO — vitrine pública (credenciados) */
export interface ArbitroPublicoDTO {
  id: string
  nome: string
  cidade: string | null
  uf: string | null
  nivel: string | null
  fotoUrl: string | null
}

export type GaleriaTamanho = 'large' | 'medium' | 'small'

/** FotoDTO — foto da galeria pública */
export interface FotoDTO {
  id: string
  imagemUrl: string
  evento: string
  ano: string | null
  categoria: string | null
  tamanho: GaleriaTamanho
  createdAt: string
}
