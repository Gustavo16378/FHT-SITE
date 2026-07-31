package br.org.fht.service;

import br.org.fht.common.CPFValidator;
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
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
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

    public static final String STATUS_AGUARDANDO_PAGAMENTO = "AGUARDANDO_PAGAMENTO";
    public static final String STATUS_AGUARDANDO_APROVACAO = "AGUARDANDO_APROVACAO";
    public static final String STATUS_ATIVO = "ATIVO";

    @Inject AtletaRepository atletaRepository;
    @Inject ClubeRepository clubeRepository;
    @Inject ConsentimentoRepository consentimentoRepository;
    @Inject R2StorageService r2;

    /** Prazo para anexar o comprovante de pagamento antes do cadastro ser apagado. */
    @ConfigProperty(name = "atleta.pagamento.prazo-horas", defaultValue = "24")
    long prazoPagamentoHoras;

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
        atleta.setNomeCompleto(form.nomeCompleto);
        atleta.setDataNascimento(nascimento);
        atleta.setSexo(form.sexo);
        atleta.setCpf(form.cpf);
        atleta.setRg(form.rg);
        atleta.setRgOrgaoEmissor(form.rgOrgaoEmissor);
        atleta.setNaturalidadeCidade(form.naturalidadeCidade);
        atleta.setNaturalidadeUf(form.naturalidadeUf);
        atleta.setTelefone(form.telefone);
        atleta.setEmail(form.email);
        atleta.setCep(form.cep);
        atleta.setLogradouro(form.logradouro);
        atleta.setNumero(form.numero);
        atleta.setCidade(form.cidade);
        atleta.setUfResidencia(form.ufResidencia);
        atleta.setPosicao(form.posicao);
        atleta.setCategoria(form.categoria);
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

        // Com comprovante, já entra na fila de aprovação da federação. Sem comprovante,
        // o cadastro tem prazo para pagar — vencido, é apagado pelo job de expurgo.
        if (atleta.getComprovantePagamentoUrl() != null) {
            atleta.setStatus(STATUS_AGUARDANDO_APROVACAO);
        } else {
            atleta.setStatus(STATUS_AGUARDANDO_PAGAMENTO);
            atleta.setPrazoPagamentoAte(LocalDateTime.now().plusHours(prazoPagamentoHoras));
        }

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
        String role = jwt.getClaim("role");
        List<Atleta> atletas;
        if ("ADMIN_CLUBE".equals(role)) {
            UUID clubeId = UUID.fromString((String) jwt.getClaim("clubeId"));
            atletas = atletaRepository.findByClubeId(clubeId);
        } else {
            atletas = atletaRepository.listAllOrdered();
        }

        // Os painéis abrem o detalhe com o objeto da lista, então os consentimentos precisam vir
        // já aqui — carregados numa query só para não virar N+1.
        Map<UUID, List<Consentimento>> porAtleta = consentimentoRepository
                .findByAtletaIds(atletas.stream().map(Atleta::getId).toList())
                .stream().collect(Collectors.groupingBy(Consentimento::getAtletaId));

        return atletas.stream()
                .map(a -> AtletaMapper.toResponse(a, porAtleta.getOrDefault(a.getId(), List.of())))
                .toList();
    }

    @Override
    @Transactional
    public AtletaResponseDTO atualizar(UUID id, AtletaUpdateForm form, JsonWebToken jwt) {
        Atleta atleta = buscarComEscopo(id, jwt);

        // Atualização parcial: só aplica campos não nulos. Não mexe em CPF, documentos nem status.
        if (form.nomeCompleto() != null) atleta.setNomeCompleto(form.nomeCompleto());
        if (form.dataNascimento() != null && !form.dataNascimento().isBlank())
            atleta.setDataNascimento(LocalDate.parse(form.dataNascimento()));
        if (form.sexo() != null) atleta.setSexo(form.sexo());
        if (form.rg() != null) atleta.setRg(form.rg());
        if (form.telefone() != null) atleta.setTelefone(form.telefone());
        if (form.email() != null) atleta.setEmail(form.email());
        if (form.cidade() != null) atleta.setCidade(form.cidade());
        if (form.ufResidencia() != null) atleta.setUfResidencia(form.ufResidencia());
        if (form.posicao() != null) atleta.setPosicao(form.posicao());
        if (form.categoria() != null) atleta.setCategoria(form.categoria());
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
        return AtletaMapper.toResponse(atleta, consentimentoRepository.findByAtletaId(id));
    }

    /** ADMIN_CLUBE só alcança atleta do próprio clube; ADMIN_FHT alcança qualquer um. */
    private Atleta buscarComEscopo(UUID id, JsonWebToken jwt) {
        if ("ADMIN_CLUBE".equals((String) jwt.getClaim("role"))) {
            UUID clubeId = UUID.fromString((String) jwt.getClaim("clubeId"));
            return atletaRepository.findByClubeIdAndId(clubeId, id)
                    .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
        }
        return atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
    }

    @Override
    @Transactional
    public void aprovar(UUID id) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));

        if (atleta.getComprovantePagamentoUrl() == null || atleta.getComprovantePagamentoUrl().isBlank()) {
            throw new ValidationException("comprovantePagamento", "Comprovante de pagamento não enviado — aprovação bloqueada");
        }

        // Menor sem o consentimento do responsável não pode ser ativado (LGPD art. 14, §1).
        if (atleta.isMenorDeIdade(Fuso.hoje()) && !temConsentimentoCadastro(id)) {
            throw new ValidationException("consentimentoCadastro",
                    "Atleta menor de idade sem consentimento do responsável legal — aprovação bloqueada (LGPD art. 14)");
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
