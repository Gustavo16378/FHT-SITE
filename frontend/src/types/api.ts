// Tipos espelhando os DTOs do backend (br.org.fht.dto.*).
// Todas as respostas da API vêm embrulhadas em ApiResponse<T>.

export interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export type ClubeStatus = 'PENDENTE' | 'ATIVO' | 'REJEITADO' | 'SUSPENSO'
export type AtletaStatus = 'AGUARDANDO_PAGAMENTO' | 'ATIVO' | 'REJEITADO' | 'SUSPENSO'

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
  createdAt: string
  updatedAt: string
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
  fotoUrl: string | null
  rgUrl: string | null
  comprovanteResidenciaUrl: string | null
  comprovantePagamentoUrl: string | null
  status: AtletaStatus
  motivoRejeicao: string | null
  taxaValor: number | null
  taxaAno: number | null
  createdAt: string
}

/** GET /api/admin/dashboard */
export interface AdminDashboardDTO {
  clubes: { total: number; pendentes: number; ativos: number }
  atletas: { total: number; pendentes: number; ativos: number }
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

/** POST /api/noticias/upload-imagem */
export interface UploadResponse {
  url: string
}
