package br.org.fht.service;

import br.org.fht.common.CPFValidator;
import br.org.fht.common.Campos;
import br.org.fht.common.Escopo;
import br.org.fht.common.Fuso;
import br.org.fht.common.OrigemRequisicao;
import br.org.fht.dto.atleta.AtletaDocumentosForm;
import br.org.fht.dto.atleta.AtletaForm;
import br.org.fht.dto.atleta.AtletaResponseDTO;
import br.org.fht.dto.atleta.AtletaUpdateForm;
import br.org.fht.exception.ValidationException;
import br.org.fht.mapper.AtletaMapper;
import br.org.fht.model.Atleta;
import br.org.fht.model.Consentimento;
import br.org.fht.repository.AtletaRepository;
import br.org.fht.repository.ClubeRepository;
import br.org.fht.repository.ConsentimentoRepository;
import br.org.fht.repository.PagamentoLoteItemRepository;
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class AtletaServiceImpl implements AtletaService {

    private static final org.jboss.logging.Logger LOG =
            org.jboss.logging.Logger.getLogger(AtletaServiceImpl.class);

    public static final String STATUS_AGUARDANDO_PAGAMENTO = "AGUARDANDO_PAGAMENTO";
    public static final String STATUS_AGUARDANDO_APROVACAO = "AGUARDANDO_APROVACAO";
    public static final String STATUS_ATIVO = "ATIVO";

    @Inject AtletaRepository atletaRepository;
    @Inject ClubeRepository clubeRepository;
    @Inject ConsentimentoRepository consentimentoRepository;
    @Inject PagamentoLoteItemRepository loteItemRepository;
    @Inject R2StorageService r2;

    @Override
    @Transactional
    public AtletaResponseDTO cadastrar(AtletaForm form, JsonWebToken jwt, OrigemRequisicao origem) {
        String clubeIdStr = jwt.getClaim("clubeId");
        if (clubeIdStr == null) {
            throw new WebApplicationException("Clube não associado ao token", 403);
        }
        UUID clubeId = UUID.fromString(clubeIdStr);

        var clube = clubeRepository.findByIdOptional(clubeId)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        if (!"ATIVO".equals(clube.getStatus())) {
            throw new WebApplicationException("Clube não está ativo. Aguarde aprovação da FHT.", 403);
        }

        if (!CPFValidator.isValid(form.cpf)) {
            throw new ValidationException("cpf", "CPF inválido");
        }
        if (atletaRepository.existsByCpf(form.cpf)) {
            throw new WebApplicationException("CPF já cadastrado", 409);
        }

        LocalDate nascimento = parseNascimento(form.dataNascimento);

        // RG digitalizado é o único documento obrigatório no ato do cadastro.
        // Ver docs/MODULO-ATLETA-FLUXO.md §2.
        if (vazio(form.rgDoc)) {
            throw new ValidationException("rgDoc", "RG digitalizado é obrigatório no cadastro");
        }

        // LGPD art. 14: atleta menor exige dados e consentimento do responsável legal.
        boolean menor = nascimento.plusYears(18).isAfter(Fuso.hoje());
        if (menor) {
            validarResponsavel(form);
        }

        var atleta = new Atleta();
        atleta.setClubeId(clubeId);
        // Colunas NOT NULL entram por Campos.obrigatorio: sem isso a ausência ou o estouro só
        // aparecem no INSERT e o clube lê "Erro interno do servidor" com o formulário todo preenchido.
        atleta.setNomeCompleto(Campos.obrigatorio(form.nomeCompleto, 255, "nomeCompleto", "Nome completo é obrigatório"));
        atleta.setDataNascimento(nascimento);
        atleta.setSexo(Campos.obrigatorio(form.sexo, 10, "sexo", "Sexo é obrigatório"));
        atleta.setCpf(form.cpf);
        atleta.setRg(Campos.obrigatorio(form.rg, 30, "rg", "RG é obrigatório"));
        atleta.setRgOrgaoEmissor(Campos.tamanho(form.rgOrgaoEmissor, 50, "rgOrgaoEmissor"));
        atleta.setNaturalidadeCidade(Campos.tamanho(form.naturalidadeCidade, 100, "naturalidadeCidade"));
        atleta.setNaturalidadeUf(Campos.tamanho(form.naturalidadeUf, 2, "naturalidadeUf"));
        atleta.setTelefone(Campos.tamanho(form.telefone, 20, "telefone"));
        atleta.setEmail(Campos.tamanho(form.email, 255, "email"));
        atleta.setCep(Campos.tamanho(form.cep, 9, "cep"));
        atleta.setLogradouro(Campos.tamanho(form.logradouro, 255, "logradouro"));
        atleta.setNumero(Campos.tamanho(form.numero, 20, "numero"));
        atleta.setCidade(Campos.tamanho(form.cidade, 100, "cidade"));
        atleta.setUfResidencia(Campos.tamanho(form.ufResidencia, 2, "ufResidencia"));
        // Multi-seleção: as posições chegam concatenadas. Coluna alargada pra 200 na V17.
        atleta.setPosicao(Campos.obrigatorio(form.posicao, 200, "posicao", "Informe ao menos uma posição"));
        atleta.setCategoria(Campos.obrigatorio(form.categoria, 20, "categoria", "Categoria é obrigatória"));
        atleta.setTransferencia("true".equalsIgnoreCase(form.isTransferencia));
        atleta.setClubeAnterior(form.clubeAnterior);

        if (menor) {
            atleta.setResponsavelNome(form.responsavelNome);
            atleta.setResponsavelCpf(form.responsavelCpf);
            atleta.setResponsavelParentesco(form.responsavelParentesco);
            atleta.setResponsavelEmail(form.responsavelEmail);
            atleta.setResponsavelTelefone(form.responsavelTelefone);
        }

        String baseKey = "atletas/" + clubeId + "/" + UUID.randomUUID();

        if (!vazio(form.foto)) {
            atleta.setFotoUrl(r2.upload(baseKey + "/foto_" + form.foto.fileName(), form.foto));
        }
        atleta.setRgUrl(r2.upload(baseKey + "/rg_" + form.rgDoc.fileName(), form.rgDoc));
        if (!vazio(form.comprovanteResidencia)) {
            atleta.setComprovanteResidenciaUrl(r2.upload(baseKey + "/res_" + form.comprovanteResidencia.fileName(), form.comprovanteResidencia));
        }
        if (!vazio(form.comprovantePix)) {
            atleta.setComprovantePagamentoUrl(r2.upload(baseKey + "/pix_" + form.comprovantePix.fileName(), form.comprovantePix));
        }

        // O pagamento nao e mais no ato do cadastro: o clube junta os atletas e paga tudo num lote
        // quando puder. Por isso o cadastro nasce sempre AGUARDANDO_PAGAMENTO e sem prazo — quem
        // libera e a baixa do lote pela federacao.
        atleta.setStatus(STATUS_AGUARDANDO_PAGAMENTO);

        atletaRepository.persist(atleta);

        List<Consentimento> consentimentos = registrarConsentimentos(atleta, form, menor, origem);
        return AtletaMapper.toResponse(atleta, consentimentos);
    }

    /**
     * Um registro por finalidade (LGPD art. 14, §1 — "específico e em destaque"), com a
     * evidência de quem consentiu e de onde. Ver docs/LGPD-CONFORMIDADE.md §2.3.
     */
    private List<Consentimento> registrarConsentimentos(Atleta atleta, AtletaForm form,
                                                        boolean menor, OrigemRequisicao origem) {
        // Quem consente: o responsável legal, se menor; o próprio titular, se adulto.
        String quemNome = menor ? form.responsavelNome : form.nomeCompleto;
        String quemCpf = menor ? form.responsavelCpf : form.cpf;

        var registrados = new ArrayList<Consentimento>();

        if (menor) {
            registrados.add(novoConsentimento(atleta, Consentimento.FINALIDADE_CADASTRO_MENOR,
                    true, quemNome, quemCpf, origem));
        }
        if (marcado(form.consentimentoImagem)) {
            registrados.add(novoConsentimento(atleta, Consentimento.FINALIDADE_IMAGEM_PUBLICA,
                    menor, quemNome, quemCpf, origem));
        }

        registrados.forEach(consentimentoRepository::persist);
        return registrados;
    }

    private Consentimento novoConsentimento(Atleta atleta, String finalidade, boolean titularMenor,
                                            String quemNome, String quemCpf, OrigemRequisicao origem) {
        var c = new Consentimento();
        c.setAtletaId(atleta.getId());
        c.setFinalidade(finalidade);
        c.setTitularMenor(titularMenor);
        c.setConsentidoPorNome(quemNome);
        c.setConsentidoPorCpf(quemCpf);
        c.setTextoVersao(Consentimento.TEXTO_VERSAO_ATUAL);
        c.setConcedidoEm(LocalDateTime.now());
        if (origem != null) {
            c.setIpOrigem(origem.ip());
            c.setUserAgent(origem.userAgent());
        }
        return c;
    }

    private void validarResponsavel(AtletaForm form) {
        if (branco(form.responsavelNome)) {
            throw new ValidationException("responsavelNome",
                    "Atleta menor de idade: nome do responsável legal é obrigatório (LGPD art. 14)");
        }
        if (!CPFValidator.isValid(form.responsavelCpf)) {
            throw new ValidationException("responsavelCpf",
                    "Atleta menor de idade: CPF do responsável legal é obrigatório e deve ser válido");
        }
        if (branco(form.responsavelParentesco)) {
            throw new ValidationException("responsavelParentesco",
                    "Atleta menor de idade: informe o parentesco do responsável legal");
        }
        if (branco(form.responsavelEmail) && branco(form.responsavelTelefone)) {
            throw new ValidationException("responsavelEmail",
                    "Atleta menor de idade: informe e-mail ou telefone do responsável legal para contato");
        }
        if (!marcado(form.consentimentoCadastro)) {
            throw new ValidationException("consentimentoCadastro",
                    "Atleta menor de idade: é obrigatório o aceite do termo pelo responsável legal (LGPD art. 14, §1)");
        }
    }

    private LocalDate parseNascimento(String valor) {
        if (branco(valor)) {
            throw new ValidationException("dataNascimento", "Data de nascimento é obrigatória");
        }
        LocalDate nascimento;
        try {
            nascimento = LocalDate.parse(valor);
        } catch (java.time.format.DateTimeParseException e) {
            throw new ValidationException("dataNascimento", "Data de nascimento inválida (use AAAA-MM-DD)");
        }
        if (nascimento.isAfter(Fuso.hoje())) {
            throw new ValidationException("dataNascimento", "Data de nascimento não pode ser no futuro");
        }
        return nascimento;
    }

    private static boolean vazio(FileUpload f) {
        return f == null || f.size() == 0;
    }

    private static boolean branco(String s) {
        return s == null || s.isBlank();
    }

    private static boolean marcado(String s) {
        return "true".equalsIgnoreCase(s) || "on".equalsIgnoreCase(s) || "1".equals(s);
    }

    @Override
    public List<AtletaResponseDTO> listar(JsonWebToken jwt) {
        // Allowlist: só a federação vê todos. Qualquer outro papel fica preso ao próprio clube.
        List<Atleta> atletas = Escopo.ehAdminFederacao(jwt)
                ? atletaRepository.listAllOrdered()
                : atletaRepository.findByClubeId(Escopo.clubeDoToken(jwt));

        // Os painéis abrem o detalhe com o objeto da lista, então os consentimentos precisam vir
        // já aqui — carregados numa query só para não virar N+1.
        Map<UUID, List<Consentimento>> porAtleta = consentimentoRepository
                .findByAtletaIds(atletas.stream().map(Atleta::getId).toList())
                .stream().collect(Collectors.groupingBy(Consentimento::getAtletaId));

        int ano = Fuso.hoje().getYear();
        return atletas.stream()
                .map(a -> AtletaMapper.toResponse(a, porAtleta.getOrDefault(a.getId(), List.of()),
                        loteItemRepository.temPagamentoConfirmado(a.getId(), ano)))
                .toList();
    }

    @Override
    @Transactional
    public AtletaResponseDTO atualizar(UUID id, AtletaUpdateForm form, JsonWebToken jwt) {
        Atleta atleta = buscarComEscopo(id, jwt);

        // Atualização parcial: só aplica campos não nulos. Não mexe em CPF, documentos nem status.
        // Mesmas guardas de tamanho do cadastro — a edição escrevia direto na coluna e estourava igual.
        if (form.nomeCompleto() != null)
            atleta.setNomeCompleto(Campos.obrigatorio(form.nomeCompleto(), 255, "nomeCompleto", "Nome completo não pode ficar vazio"));
        // parseNascimento trata formato inválido; LocalDate.parse cru devolvia 500 na edição.
        if (form.dataNascimento() != null && !form.dataNascimento().isBlank())
            atleta.setDataNascimento(parseNascimento(form.dataNascimento()));
        if (form.sexo() != null) atleta.setSexo(Campos.tamanho(form.sexo(), 10, "sexo"));
        if (form.rg() != null) atleta.setRg(Campos.tamanho(form.rg(), 30, "rg"));
        if (form.telefone() != null) atleta.setTelefone(Campos.tamanho(form.telefone(), 20, "telefone"));
        if (form.email() != null) atleta.setEmail(Campos.tamanho(form.email(), 255, "email"));
        if (form.cidade() != null) atleta.setCidade(Campos.tamanho(form.cidade(), 100, "cidade"));
        if (form.ufResidencia() != null) atleta.setUfResidencia(Campos.tamanho(form.ufResidencia(), 2, "ufResidencia"));
        if (form.posicao() != null) atleta.setPosicao(Campos.tamanho(form.posicao(), 200, "posicao"));
        if (form.categoria() != null) atleta.setCategoria(Campos.tamanho(form.categoria(), 20, "categoria"));
        if (form.transferencia() != null) atleta.setTransferencia(form.transferencia());
        if (form.clubeAnterior() != null) atleta.setClubeAnterior(form.clubeAnterior());

        atualizarResponsavel(atleta, form, jwt);

        // entidade managed + @Transactional → dirty checking persiste no commit
        return AtletaMapper.toResponse(atleta, consentimentoRepository.findByAtletaId(id));
    }

    /**
     * Permite completar/corrigir o responsável legal e registrar o consentimento que faltava.
     * Sem isto, um menor cadastrado antes da V12 nunca poderia ser aprovado.
     */
    private void atualizarResponsavel(Atleta atleta, AtletaUpdateForm form, JsonWebToken jwt) {
        if (form.responsavelNome() != null) atleta.setResponsavelNome(form.responsavelNome());
        if (form.responsavelParentesco() != null) atleta.setResponsavelParentesco(form.responsavelParentesco());
        if (form.responsavelEmail() != null) atleta.setResponsavelEmail(form.responsavelEmail());
        if (form.responsavelTelefone() != null) atleta.setResponsavelTelefone(form.responsavelTelefone());
        if (form.responsavelCpf() != null && !form.responsavelCpf().isBlank()) {
            if (!CPFValidator.isValid(form.responsavelCpf())) {
                throw new ValidationException("responsavelCpf", "CPF do responsável legal inválido");
            }
            atleta.setResponsavelCpf(form.responsavelCpf());
        }

        if (!Boolean.TRUE.equals(form.consentimentoCadastro())) return;

        if (!atleta.isMenorDeIdade(Fuso.hoje())) {
            throw new ValidationException("consentimentoCadastro",
                    "Consentimento de responsável só se aplica a atleta menor de idade");
        }
        if (branco(atleta.getResponsavelNome()) || branco(atleta.getResponsavelCpf())) {
            throw new ValidationException("responsavelNome",
                    "Informe nome e CPF do responsável legal antes de registrar o consentimento");
        }
        if (temConsentimentoCadastro(atleta.getId())) return; // já existe, não duplica

        var c = novoConsentimento(atleta, Consentimento.FINALIDADE_CADASTRO_MENOR, true,
                atleta.getResponsavelNome(), atleta.getResponsavelCpf(), null);
        // Sem IP/user-agent aqui: a evidência é o usuário logado que registrou a regularização.
        c.setUserAgent("regularizado por " + jwt.getName());
        consentimentoRepository.persist(c);
    }

    @Override
    @Transactional
    public AtletaResponseDTO anexarDocumentos(UUID id, AtletaDocumentosForm form, JsonWebToken jwt) {
        Atleta atleta = buscarComEscopo(id, jwt);

        if (vazio(form.foto) && vazio(form.rgDoc) && vazio(form.comprovanteResidencia) && vazio(form.comprovantePix)) {
            throw new ValidationException("documentos", "Nenhum arquivo enviado");
        }

        String baseKey = "atletas/" + atleta.getClubeId() + "/" + atleta.getId();

        if (!vazio(form.foto)) {
            atleta.setFotoUrl(r2.upload(baseKey + "/foto_" + form.foto.fileName(), form.foto));
        }
        if (!vazio(form.rgDoc)) {
            atleta.setRgUrl(r2.upload(baseKey + "/rg_" + form.rgDoc.fileName(), form.rgDoc));
        }
        if (!vazio(form.comprovanteResidencia)) {
            atleta.setComprovanteResidenciaUrl(r2.upload(baseKey + "/res_" + form.comprovanteResidencia.fileName(), form.comprovanteResidencia));
        }
        if (!vazio(form.comprovantePix)) {
            atleta.setComprovantePagamentoUrl(r2.upload(baseKey + "/pix_" + form.comprovantePix.fileName(), form.comprovantePix));
            // Comprovante anexado dentro do prazo: sai da fila de expurgo e vai para aprovação.
            if (STATUS_AGUARDANDO_PAGAMENTO.equals(atleta.getStatus())) {
                atleta.setStatus(STATUS_AGUARDANDO_APROVACAO);
            }
            atleta.setPrazoPagamentoAte(null);
        }

        return AtletaMapper.toResponse(atleta, consentimentoRepository.findByAtletaId(id));
    }

    @Override
    public AtletaResponseDTO buscarPorId(UUID id, JsonWebToken jwt) {
        Atleta atleta = buscarComEscopo(id, jwt);
        return AtletaMapper.toResponse(atleta, consentimentoRepository.findByAtletaId(id),
                loteItemRepository.temPagamentoConfirmado(id, Fuso.hoje().getYear()));
    }

    /** Só ADMIN_FHT alcança qualquer atleta; qualquer outro papel fica preso ao próprio clube. */
    private Atleta buscarComEscopo(UUID id, JsonWebToken jwt) {
        if (Escopo.ehAdminFederacao(jwt)) {
            return atletaRepository.findByIdOptional(id)
                    .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
        }
        return atletaRepository.findByClubeIdAndId(Escopo.clubeDoToken(jwt), id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
    }

    @Override
    @Transactional
    public void aprovar(UUID id, boolean dispensarPagamento, JsonWebToken jwt) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));

        // PORTÃO DOCUMENTAL — INEGOCIÁVEL. RG e, se menor, o consentimento do responsável
        // (LGPD art. 14, §1). Nenhuma dispensa passa por aqui: a federação não pode abrir mão
        // da autorização do responsável de um menor por decisão administrativa.
        if (atleta.getRgUrl() == null || atleta.getRgUrl().isBlank()) {
            throw new ValidationException("rgDoc", "RG digitalizado não enviado — aprovação bloqueada");
        }
        if (atleta.isMenorDeIdade(Fuso.hoje()) && !temConsentimentoCadastro(id)) {
            throw new ValidationException("consentimentoCadastro",
                    "Atleta menor de idade sem consentimento do responsável legal — aprovação bloqueada (LGPD art. 14)");
        }

        // PORTÃO FINANCEIRO — DISPENSÁVEL pela federação. Como o pagamento agora é em lote e a
        // conferência é manual, quem olha o comprovante decide quem liberar: um lote pode cobrir
        // parcialmente, ou o clube pode ter pago por fora. Sem a dispensa explícita, continua
        // exigindo a baixa — para ninguém ativar sem pagamento por descuido.
        int ano = Fuso.hoje().getYear();
        if (!loteItemRepository.temPagamentoConfirmado(id, ano)) {
            if (!dispensarPagamento) {
                throw new ValidationException("pagamento",
                        "Anuidade de " + ano + " sem baixa confirmada — aprovação bloqueada");
            }
            // Não há tabela de auditoria ainda; o log é o único rastro de quem liberou sem baixa.
            LOG.warnf("Atleta %s (%s) ativado SEM baixa de pagamento em %d, por decisão de %s",
                    atleta.getId(), atleta.getNomeCompleto(), ano, jwt.getName());
        }

        atleta.setStatus(STATUS_ATIVO);
        atleta.setMotivoRejeicao(null);
        atleta.setPrazoPagamentoAte(null);
    }

    private boolean temConsentimentoCadastro(UUID atletaId) {
        return consentimentoRepository.findByAtletaId(atletaId).stream()
                .anyMatch(c -> Consentimento.FINALIDADE_CADASTRO_MENOR.equals(c.getFinalidade())
                        && c.getRevogadoEm() == null);
    }

    @Override
    @Transactional
    public void rejeitar(UUID id, String motivo) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));

        atleta.setStatus("REJEITADO");
        atleta.setMotivoRejeicao(motivo);
        atleta.setPrazoPagamentoAte(null);
    }

    /**
     * Desfaz a rejeição, devolvendo o atleta à fila de aprovação.
     *
     * <p>Rejeitar era irreversível: o clube não pode recadastrar (409 de CPF já existente),
     * {@code reativar} recusa qualquer status que não seja SUSPENSO, e o painel não oferecia botão
     * em REJEITADO. Uma rejeição por engano só se desfazia no banco — apagando o atleta, o que
     * levava junto os consentimentos por cascata.
     *
     * <p>Volta para AGUARDANDO_APROVACAO se a anuidade do ano já tem baixa; senão, para
     * AGUARDANDO_PAGAMENTO. Quem decide ativar continua sendo a federação, pelos dois portões.
     */
    @Override
    @Transactional
    public void reconsiderar(UUID id) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));

        if (!"REJEITADO".equals(atleta.getStatus())) {
            throw new WebApplicationException("Apenas atletas rejeitados podem voltar para análise", 409);
        }

        boolean pago = loteItemRepository.temPagamentoConfirmado(id, Fuso.hoje().getYear());
        atleta.setStatus(pago ? STATUS_AGUARDANDO_APROVACAO : STATUS_AGUARDANDO_PAGAMENTO);
        atleta.setMotivoRejeicao(null);
    }

    @Override
    @Transactional
    public void suspender(UUID id) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));

        if (!STATUS_ATIVO.equals(atleta.getStatus())) {
            throw new WebApplicationException("Apenas atletas ativos podem ser suspensos", 409);
        }

        atleta.setStatus("SUSPENSO");
    }

    @Override
    @Transactional
    public void reativar(UUID id) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));

        if (!"SUSPENSO".equals(atleta.getStatus())) {
            throw new WebApplicationException("Apenas atletas suspensos podem ser reativados", 409);
        }

        atleta.setStatus(STATUS_ATIVO);
    }

    @Override
    @Transactional
    public void deletar(UUID id) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
        atletaRepository.delete(atleta);
    }
}
