// Tipos espelhando os DTOs do backend (br.org.fht.dto.*).
// Todas as respostas da API vêm embrulhadas em ApiResponse<T>.

export interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export type ClubeStatus = 'PENDENTE' | 'ATIVO' | 'REJEITADO' | 'SUSPENSO'
export type AtletaStatus = 'AGUARDANDO_PAGAMENTO' | 'AGUARDANDO_APROVACAO' | 'ATIVO' | 'REJEITADO' | 'SUSPENSO'

/**
 * Status efetivo da competição. EM_BREVE / EM_ANDAMENTO / ENCERRADO são derivados das datas
 * no backend; os demais só existem como override manual do admin.
 */
export type CompeticaoStatus =
  | 'EM_BREVE' | 'INSCRICOES_ABERTAS' | 'EM_ANDAMENTO' | 'ENCERRADO' | 'ADIADO' | 'CANCELADO'

/** Override manual — subconjunto de CompeticaoStatus (EM_BREVE nunca é setado à mão) */
export type CompeticaoStatusOverride = Exclude<CompeticaoStatus, 'EM_BREVE'>

export type CompeticaoCategoria =
  | 'adulto' | 'sub-18' | 'sub-16' | 'sub-14' | 'sub-12' | 'feminino' | 'masculino' | 'master'

/** CompeticaoResponseDTO — visão administrativa */
export interface CompeticaoDTO {
  id: string
  nome: string
  descricao: string | null
  categorias: CompeticaoCategoria[]
  dataInicio: string
  dataFim: string
  local: string | null
  cidade: string | null
  uf: string | null
  temporada: number
  numeroEquipes: number
  linkInscricao: string | null
  cor: string
  regulamentoUrl: string | null
  status: CompeticaoStatus
  /** nulo = status automático pelas datas */
  statusOverride: CompeticaoStatusOverride | null
  visivelNaHome: boolean
  createdAt: string
}

/** CompeticaoPublicaDTO — card do site público (sem campos administrativos) */
export interface CompeticaoPublicaDTO {
  id: string
  nome: string
  descricao: string | null
  categorias: CompeticaoCategoria[]
  dataInicio: string
  dataFim: string
  local: string | null
  cidade: string | null
  uf: string | null
  temporada: number
  numeroEquipes: number
  linkInscricao: string | null
  cor: string
  regulamentoUrl: string | null
  status: CompeticaoStatus
}

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
  representanteCargo: string | null
  representanteCpf: string | null
  ataFundacaoUrl: string | null
  estatutoUrl: string | null
  status: ClubeStatus
  motivoRejeicao: string | null
  visivelNaHome: boolean
  createdAt: string
  updatedAt: string
}

/* ── Pagamento da anuidade em lote ── */

export type PagamentoLoteStatus = 'AGUARDANDO_BAIXA' | 'CONFIRMADO' | 'REJEITADO'

/** Alimenta o botão de pagamento do clube: quem está devendo e quanto dá */
export interface PagamentoPendentesDTO {
  ano: number
  valorUnitario: number
  valorTotal: number
  atletas: { id: string; nome: string; categoria: string; valor: number }[]
}

/** Um pagamento em lote: N atletas cobertos por 1 comprovante */
export interface PagamentoLoteDTO {
  id: string
  clubeId: string
  clubeNome: string | null
  protocolo: string
  ano: number
  valorTotal: number
  quantidadeAtletas: number
  comprovanteUrl: string | null
  status: PagamentoLoteStatus
  observacao: string | null
  motivoRejeicao: string | null
  enviadoEm: string
  baixadoEm: string | null
  baixadoPor: string | null
  /** atletaId é nulo se o atleta foi removido depois — o nome fica no snapshot */
  itens: { atletaId: string | null; atletaNome: string; valor: number }[]
}

/** Resultado da baixa: quem foi ativado e quem continua barrado pela documentação */
export interface BaixaResultadoDTO {
  lote: PagamentoLoteDTO
  ativados: string[]
  bloqueados: { atletaNome: string; motivo: string }[]
}

/** Função da pessoa dentro do clube */
export type FuncaoPessoa = 'REPRESENTANTE' | 'TECNICO' | 'AUXILIAR'

/** ClubePessoaDTO — representantes e técnico. Ninguém aqui tem login próprio ainda. */
export interface ClubePessoaDTO {
  id: string
  nome: string
  cpf: string | null
  funcao: FuncaoPessoa
  cargo: string | null
  email: string | null
  telefone: string | null
  /** representante que responde pela filiação — é o dono do login */
  principal: boolean
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

/**
 * O árbitro é cadastrado pela comissão de arbitragem e já nasce CREDENCIADO.
 * PENDENTE e REJEITADO só aparecem em registros do antigo formulário público de solicitação,
 * que não existe mais.
 */
export type ArbitroStatus = 'CREDENCIADO' | 'SUSPENSO' | 'PENDENTE' | 'REJEITADO'

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
