package br.org.fht.service;

import br.org.fht.common.CPFValidator;
import br.org.fht.common.Escopo;
import br.org.fht.exception.ValidationException;
import br.org.fht.dto.clube.AtletaVitrineDTO;
import br.org.fht.dto.clube.ClubeForm;
import br.org.fht.dto.clube.ClubePessoaDTO;
import br.org.fht.dto.clube.ClubePessoaForm;
import br.org.fht.dto.clube.ClubeResponseDTO;
import br.org.fht.dto.clube.ClubeUpdateForm;
import br.org.fht.dto.clube.ClubeVitrineDTO;
import br.org.fht.dto.clube.ClubeVitrineDetalheDTO;
import br.org.fht.mapper.ClubeMapper;
import br.org.fht.model.Atleta;
import br.org.fht.model.Clube;
import br.org.fht.model.ClubePessoa;
import br.org.fht.model.Role;
import br.org.fht.model.Usuario;
import br.org.fht.repository.AtletaRepository;
import br.org.fht.repository.ClubePessoaRepository;
import br.org.fht.repository.ClubeRepository;
import br.org.fht.repository.UsuarioRepository;
import br.org.fht.storage.R2StorageService;
import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ClubeServiceImpl implements ClubeService {

    // Ordem de exibição das categorias no card/modal (as demais vão pro fim, em ordem alfabética).
    private static final List<String> ORDEM_CATEGORIAS =
            List.of("Adulto", "Sub-18", "Sub-16", "Sub-14", "Sub-12");

    @Inject ClubeRepository clubeRepository;
    @Inject UsuarioRepository usuarioRepository;
    @Inject AtletaRepository atletaRepository;
    @Inject ClubePessoaRepository clubePessoaRepository;
    @Inject EmailService emailService;
    @Inject R2StorageService r2;

    /** Mínimo da senha escolhida pelo clube no cadastro público. */
    private static final int SENHA_MIN = 8;

    @Override
    @Transactional
    public ClubeResponseDTO solicitar(ClubeForm form) {
        if (form == null || branco(form.nome)) {
            throw new ValidationException("nome", "Nome do clube é obrigatório");
        }
        if (branco(form.representanteNome)) {
            throw new ValidationException("representanteNome", "Nome do representante é obrigatório");
        }
        if (branco(form.representanteEmail)) {
            throw new ValidationException("representanteEmail", "E-mail do representante é obrigatório");
        }
        if (branco(form.senha) || form.senha.length() < SENHA_MIN) {
            throw new ValidationException("senha",
                    "Escolha uma senha de acesso com pelo menos " + SENHA_MIN + " caracteres");
        }
        if (!branco(form.representanteCpf) && !CPFValidator.isValid(form.representanteCpf)) {
            throw new ValidationException("representanteCpf", "CPF do representante inválido");
        }

        String email = form.representanteEmail.trim().toLowerCase();
        // O e-mail vira o login: barrar aqui evita criar um clube que nunca conseguiria entrar.
        if (usuarioRepository.existsByEmail(email)) {
            throw new WebApplicationException("Este e-mail já está cadastrado no sistema", 409);
        }

        var clube = new Clube();
        clube.setNome(form.nome.trim());
        clube.setCidade(form.cidade);
        clube.setUf(form.uf != null ? form.uf : "TO");
        clube.setSigla(form.sigla);
        clube.setCnpj(form.cnpj);
        clube.setRepresentanteNome(form.representanteNome.trim());
        clube.setRepresentanteEmail(email);
        clube.setRepresentanteTelefone(form.representanteTelefone);
        clube.setRepresentanteCargo(form.representanteCargo);
        clube.setRepresentanteCpf(form.representanteCpf);

        if (form.ata != null && form.ata.size() > 0) {
            String key = "clubes/" + UUID.randomUUID() + "/" + form.ata.fileName();
            clube.setAtaFundacaoUrl(r2.upload(key, form.ata));
        }
        if (form.estatuto != null && form.estatuto.size() > 0) {
            String key = "clubes/" + UUID.randomUUID() + "/" + form.estatuto.fileName();
            clube.setEstatutoUrl(r2.upload(key, form.estatuto));
        }

        clubeRepository.persist(clube);

        // A conta nasce JUNTO com a solicitação, com a senha que o próprio clube escolheu, porém
        // INATIVA — o login já recusa usuário inativo com 403. Aprovar vira só liberar o acesso.
        var usuario = new Usuario();
        usuario.setNome(clube.getRepresentanteNome());
        usuario.setEmail(email);
        usuario.setSenhaHash(BcryptUtil.bcryptHash(form.senha));
        usuario.setRole(Role.ADMIN_CLUBE);
        usuario.setClubeId(clube.getId());
        usuario.setAtivo(false);
        usuarioRepository.persist(usuario);

        // O representante do formulário é a primeira pessoa do clube (a principal).
        var principal = new ClubePessoa();
        principal.setClubeId(clube.getId());
        principal.setNome(clube.getRepresentanteNome());
        principal.setCpf(form.representanteCpf);
        principal.setFuncao(ClubePessoa.FUNCAO_REPRESENTANTE);
        principal.setCargo(form.representanteCargo);
        principal.setEmail(email);
        principal.setTelefone(form.representanteTelefone);
        principal.setPrincipal(true);
        clubePessoaRepository.persist(principal);

        emailService.avisarNovaSolicitacaoClube(
                clube.getNome(), clube.getCidade(), clube.getRepresentanteNome(), email);
        emailService.confirmarSolicitacaoRecebida(email, clube.getNome(), clube.getRepresentanteNome());

        return ClubeMapper.toResponse(clube);
    }

    private static boolean branco(String s) {
        return s == null || s.isBlank();
    }

    @Override
    public List<ClubeResponseDTO> listar() {
        return clubeRepository.listAllOrdered()
                .stream()
                .map(ClubeMapper::toResponse)
                .toList();
    }

    @Override
    public ClubeResponseDTO buscarPorId(UUID id, JsonWebToken jwt) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        // Allowlist: só a federação alcança qualquer clube; os demais, apenas o próprio.
        if (!Escopo.ehAdminFederacao(jwt) && !id.equals(Escopo.clubeDoToken(jwt))) {
            throw new WebApplicationException("Acesso negado", 403);
        }

        return ClubeMapper.toResponse(clube);
    }

    @Override
    @Transactional
    public ClubeResponseDTO atualizar(UUID id, ClubeUpdateForm form, JsonWebToken jwt) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        // Escopo: só ADMIN_FHT edita qualquer clube; os demais, apenas o próprio.
        if (!Escopo.ehAdminFederacao(jwt) && !id.equals(Escopo.clubeDoToken(jwt))) {
            throw new WebApplicationException("Acesso negado", 403);
        }

        // Atualização parcial — não mexe em status, documentos nem filiação.
        if (form.nome() != null) clube.setNome(form.nome());
        if (form.cidade() != null) clube.setCidade(form.cidade());
        if (form.uf() != null) clube.setUf(form.uf());
        if (form.sigla() != null) clube.setSigla(form.sigla());
        if (form.cnpj() != null) clube.setCnpj(form.cnpj());
        if (form.representanteNome() != null) clube.setRepresentanteNome(form.representanteNome());
        if (form.representanteEmail() != null) trocarEmailDoRepresentante(clube, form.representanteEmail());
        if (form.representanteTelefone() != null) clube.setRepresentanteTelefone(form.representanteTelefone());
        if (form.representanteCargo() != null) clube.setRepresentanteCargo(form.representanteCargo());

        return ClubeMapper.toResponse(clube);
    }

    @Override
    @Transactional
    public void aprovar(UUID id) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        if ("ATIVO".equals(clube.getStatus())) {
            throw new WebApplicationException("Clube já está ativo", 409);
        }

        clube.setStatus("ATIVO");
        clube.setMotivoRejeicao(null);

        // Aprovar agora é LIBERAR O ACESSO: a conta já foi criada na solicitação, com a senha que
        // o próprio clube escolheu. Antes, aprovar gerava uma senha aleatória que nunca era
        // exibida nem enviada a ninguém — a conta nascia inutilizável.
        definirAcesso(clube, true);

        emailService.avisarClubeAprovado(
                clube.getRepresentanteEmail(), clube.getNome(), clube.getRepresentanteNome());
    }

    @Override
    @Transactional
    public void rejeitar(UUID id, String motivo) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        clube.setStatus("REJEITADO");
        clube.setMotivoRejeicao(motivo);
        definirAcesso(clube, false);

        emailService.avisarClubeRejeitado(clube.getRepresentanteEmail(), clube.getNome(), motivo);
    }

    /**
     * Desfaz a rejeição, devolvendo o clube à fila de análise.
     *
     * <p>Rejeitar era irreversível e fechava as três saídas: recadastrar dava 409 de e-mail já
     * cadastrado, entrar dava 403 de usuário inativo, e o painel não oferecia botão nenhum em
     * REJEITADO. Uma rejeição por engano, ou um clube que corrigiu a documentação, só se resolvia
     * no banco.
     *
     * <p>Volta para PENDENTE de propósito — e não direto para ATIVO: quem decide aprovar é a
     * federação, no mesmo fluxo de sempre. O acesso continua fechado enquanto está pendente.
     */
    @Override
    @Transactional
    public void reconsiderar(UUID id) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        if (!"REJEITADO".equals(clube.getStatus())) {
            throw new WebApplicationException("Apenas clubes rejeitados podem voltar para análise", 409);
        }

        clube.setStatus("PENDENTE");
        clube.setMotivoRejeicao(null);
    }

    @Override
    @Transactional
    public void suspender(UUID id) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        if (!"ATIVO".equals(clube.getStatus())) {
            throw new WebApplicationException("Apenas clubes ativos podem ser suspensos", 409);
        }

        clube.setStatus("SUSPENSO");
        // Clube suspenso não opera: sem isso o representante continuaria entrando e cadastrando.
        definirAcesso(clube, false);
    }

    /**
     * O e-mail do representante <b>é</b> o login do clube — trocar um sem o outro tranca o clube
     * do lado de fora, com a senha certa. Então a conta acompanha a edição.
     *
     * <p>Recusa e-mail já usado por outra conta: sem isso a troca estouraria no índice único
     * como 500, no meio de um formulário de "Meus Dados".
     */
    private void trocarEmailDoRepresentante(Clube clube, String novoEmail) {
        String email = novoEmail.trim().toLowerCase();
        if (email.equals(clube.getRepresentanteEmail())) return;

        var conta = usuarioRepository.findByClubeId(clube.getId());
        boolean emUsoPorOutro = usuarioRepository.findByEmail(email)
                .filter(u -> conta.isEmpty() || !u.getId().equals(conta.get().getId()))
                .isPresent();
        if (emUsoPorOutro) {
            throw new WebApplicationException("E-mail já cadastrado para outro acesso", 409);
        }

        clube.setRepresentanteEmail(email);
        conta.ifPresent(u -> u.setEmail(email));
    }

    /**
     * Liga/desliga o login do representante junto com o status do clube.
     *
     * <p>Busca pelo <b>vínculo</b> (clubeId), não pelo e-mail: o clube pode trocar o e-mail do
     * representante em "Meus Dados", e a conta não acompanha. Com a busca por e-mail, depois de
     * uma troca o {@code ifPresent} não achava ninguém e falhava calado — a federação clicava em
     * suspender, o painel respondia 200 e mostrava SUSPENSO, e o representante seguia entrando e
     * cadastrando atleta normalmente. Vale igual para aprovar, rejeitar e reativar.
     */
    private void definirAcesso(Clube clube, boolean liberado) {
        usuarioRepository.findByClubeId(clube.getId())
                .ifPresent(u -> u.setAtivo(liberado));
    }

    @Override
    @Transactional
    public void reativar(UUID id) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        if (!"SUSPENSO".equals(clube.getStatus())) {
            throw new WebApplicationException("Apenas clubes suspensos podem ser reativados", 409);
        }

        clube.setStatus("ATIVO");
        definirAcesso(clube, true);
    }

    @Override
    public List<ClubeVitrineDTO> listarPublicos() {
        return clubeRepository.listVitrine().stream()
                .map(clube -> {
                    List<Atleta> ativos = atletasAtivos(clube.getId());
                    return new ClubeVitrineDTO(
                            clube.getId(),
                            clube.getNome(),
                            clube.getCidade(),
                            clube.getUf(),
                            clube.getSigla(),
                            categorias(ativos),
                            ativos.size()
                    );
                })
                .toList();
    }

    @Override
    public ClubeVitrineDetalheDTO buscarPublico(UUID id) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .filter(c -> "ATIVO".equals(c.getStatus()) && c.isVisivelNaHome())
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        List<Atleta> ativos = atletasAtivos(id);
        List<AtletaVitrineDTO> elenco = ativos.stream()
                .map(a -> new AtletaVitrineDTO(a.getNomeCompleto(), a.getPosicao(), a.getCategoria()))
                .toList();

        return new ClubeVitrineDetalheDTO(
                clube.getId(),
                clube.getNome(),
                clube.getCidade(),
                clube.getUf(),
                clube.getSigla(),
                categorias(ativos),
                ativos.size(),
                elenco
        );
    }

    @Override
    @Transactional
    public void definirVitrine(UUID id, boolean visivel) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));
        clube.setVisivelNaHome(visivel);
    }

    // --------------------- pessoas do clube ---------------------

    @Override
    public List<ClubePessoaDTO> listarPessoas(UUID clubeId, JsonWebToken jwt) {
        exigirAcessoAoClube(clubeId, jwt);
        return clubePessoaRepository.findByClubeId(clubeId).stream().map(this::toPessoaDTO).toList();
    }

    @Override
    @Transactional
    public ClubePessoaDTO adicionarPessoa(UUID clubeId, ClubePessoaForm form, JsonWebToken jwt) {
        exigirAcessoAoClube(clubeId, jwt);
        if (!clubeRepository.findByIdOptional(clubeId).isPresent()) {
            throw new WebApplicationException("Clube não encontrado", 404);
        }
        validarPessoa(form);

        var p = new ClubePessoa();
        p.setClubeId(clubeId);
        aplicarPessoa(p, form);
        // Só o representante criado na filiação é principal — quem entra aqui nunca vira dono do
        // login, porque login por pessoa depende do módulo de permissões.
        p.setPrincipal(false);
        clubePessoaRepository.persist(p);
        return toPessoaDTO(p);
    }

    @Override
    @Transactional
    public ClubePessoaDTO atualizarPessoa(UUID clubeId, UUID pessoaId, ClubePessoaForm form, JsonWebToken jwt) {
        exigirAcessoAoClube(clubeId, jwt);
        ClubePessoa p = clubePessoaRepository.findByClubeIdAndId(clubeId, pessoaId)
                .orElseThrow(() -> new WebApplicationException("Pessoa não encontrada", 404));

        if (form.funcao() != null && !ClubePessoa.FUNCOES_VALIDAS.contains(form.funcao())) {
            throw new ValidationException("funcao",
                    "Função inválida. Use: " + String.join(", ", ClubePessoa.FUNCOES_VALIDAS));
        }
        if (!branco(form.cpf()) && !CPFValidator.isValid(form.cpf())) {
            throw new ValidationException("cpf", "CPF inválido");
        }
        if (form.nome() != null && form.nome().isBlank()) {
            throw new ValidationException("nome", "Nome é obrigatório");
        }

        if (form.nome() != null) p.setNome(form.nome().trim());
        if (form.cpf() != null) p.setCpf(form.cpf());
        if (form.funcao() != null) p.setFuncao(form.funcao());
        if (form.cargo() != null) p.setCargo(form.cargo());
        if (form.email() != null) p.setEmail(form.email());
        if (form.telefone() != null) p.setTelefone(form.telefone());

        return toPessoaDTO(p);
    }

    @Override
    @Transactional
    public void removerPessoa(UUID clubeId, UUID pessoaId, JsonWebToken jwt) {
        exigirAcessoAoClube(clubeId, jwt);
        ClubePessoa p = clubePessoaRepository.findByClubeIdAndId(clubeId, pessoaId)
                .orElseThrow(() -> new WebApplicationException("Pessoa não encontrada", 404));

        // O principal é o representante da filiação e o dono do login: removê-lo deixaria o
        // clube sem responsável e sem acesso.
        if (p.isPrincipal()) {
            throw new WebApplicationException(
                    "O representante principal não pode ser removido — ele responde pela filiação", 409);
        }
        clubePessoaRepository.delete(p);
    }

    private void validarPessoa(ClubePessoaForm form) {
        if (form == null || branco(form.nome())) {
            throw new ValidationException("nome", "Nome é obrigatório");
        }
        if (branco(form.funcao()) || !ClubePessoa.FUNCOES_VALIDAS.contains(form.funcao())) {
            throw new ValidationException("funcao",
                    "Função inválida. Use: " + String.join(", ", ClubePessoa.FUNCOES_VALIDAS));
        }
        if (!branco(form.cpf()) && !CPFValidator.isValid(form.cpf())) {
            throw new ValidationException("cpf", "CPF inválido");
        }
    }

    private void aplicarPessoa(ClubePessoa p, ClubePessoaForm form) {
        p.setNome(form.nome().trim());
        p.setCpf(form.cpf());
        p.setFuncao(form.funcao());
        p.setCargo(form.cargo());
        p.setEmail(form.email());
        p.setTelefone(form.telefone());
    }

    private ClubePessoaDTO toPessoaDTO(ClubePessoa p) {
        return new ClubePessoaDTO(p.getId(), p.getNome(), p.getCpf(), p.getFuncao(),
                p.getCargo(), p.getEmail(), p.getTelefone(), p.isPrincipal());
    }

    /** Só a federação alcança qualquer clube; os demais, apenas o próprio. */
    private void exigirAcessoAoClube(UUID clubeId, JsonWebToken jwt) {
        if (!Escopo.ehAdminFederacao(jwt) && !clubeId.equals(Escopo.clubeDoToken(jwt))) {
            throw new WebApplicationException("Acesso negado", 403);
        }
    }

    // --------------------- helpers vitrine ---------------------

    private List<Atleta> atletasAtivos(UUID clubeId) {
        return atletaRepository.findByClubeId(clubeId).stream()
                .filter(a -> "ATIVO".equals(a.getStatus()))
                .toList();
    }

    /** Categorias distintas dos atletas ativos, na ordem de exibição (base primeiro). */
    private List<String> categorias(List<Atleta> atletas) {
        return atletas.stream()
                .map(Atleta::getCategoria)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .sorted(Comparator.comparingInt(this::ordemCategoria).thenComparing(Comparator.naturalOrder()))
                .toList();
    }

    private int ordemCategoria(String categoria) {
        int i = ORDEM_CATEGORIAS.indexOf(categoria);
        return i >= 0 ? i : ORDEM_CATEGORIAS.size();
    }
}
