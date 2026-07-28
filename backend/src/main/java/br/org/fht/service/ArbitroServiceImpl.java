package br.org.fht.service;

import br.org.fht.dto.arbitro.ArbitroForm;
import br.org.fht.dto.arbitro.ArbitroPublicoDTO;
import br.org.fht.dto.arbitro.ArbitroResponseDTO;
import br.org.fht.mapper.ArbitroMapper;
import br.org.fht.model.Arbitro;
import br.org.fht.repository.ArbitroRepository;
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ArbitroServiceImpl implements ArbitroService {

    @Inject ArbitroRepository arbitroRepository;
    @Inject R2StorageService r2;

    @Override
    @Transactional
    public ArbitroResponseDTO solicitar(ArbitroForm form) {
        if (form == null || form.nomeCompleto == null || form.nomeCompleto.isBlank()) {
            throw new WebApplicationException("Nome é obrigatório", 400);
        }

        Arbitro a = new Arbitro();
        a.setNome(form.nomeCompleto.trim());
        a.setCpf(form.cpf);
        a.setRg(form.rg);
        a.setOrgaoEmissor(form.orgaoEmissor);
        a.setDataNascimento(parseData(form.dataNascimento));
        a.setSexo(form.sexo);
        a.setTelefone(form.telefone);
        a.setEmail(form.email);
        a.setCidade(form.cidade);
        a.setUf(form.uf != null && !form.uf.isBlank() ? form.uf : "TO");

        a.setJaArbitro(parseBool(form.jaArbitro));
        a.setNivelAtual(form.nivelAtual);
        a.setFederacaoOrigem(form.federacaoOrigem);
        a.setTemExperiencia(parseBool(form.temExperiencia));
        a.setDescricaoExperiencia(form.descricaoExperiencia);
        a.setDisponibilidadeFds(parseBool(form.disponibilidadeFds));
        a.setCursoInteresse(form.cursoInteresse);

        a.setFotoUrl(upload("foto", form.foto));
        a.setRgUrl(upload("rg", form.rgDoc));
        a.setComprovanteEscolarUrl(upload("escolar", form.compEscolar));

        a.setStatus("PENDENTE");
        arbitroRepository.persist(a);
        return ArbitroMapper.toResponse(a);
    }

    @Override
    public List<ArbitroResponseDTO> listar() {
        return arbitroRepository.listAllOrdered().stream().map(ArbitroMapper::toResponse).toList();
    }

    @Override
    public List<ArbitroPublicoDTO> listarPublicos() {
        return arbitroRepository.listCredenciados().stream().map(ArbitroMapper::toPublico).toList();
    }

    @Override
    @Transactional
    public void credenciar(UUID id, String nivel) {
        Arbitro a = buscar(id);
        if ("CREDENCIADO".equals(a.getStatus())) {
            throw new WebApplicationException("Árbitro já está credenciado", 409);
        }
        if (nivel != null && !nivel.isBlank()) {
            a.setNivel(nivel);
        }
        a.setStatus("CREDENCIADO");
        a.setMotivoRejeicao(null);
    }

    @Override
    @Transactional
    public void rejeitar(UUID id, String motivo) {
        Arbitro a = buscar(id);
        a.setStatus("REJEITADO");
        a.setMotivoRejeicao(motivo);
    }

    @Override
    @Transactional
    public void suspender(UUID id) {
        Arbitro a = buscar(id);
        if (!"CREDENCIADO".equals(a.getStatus())) {
            throw new WebApplicationException("Apenas árbitros credenciados podem ser suspensos", 409);
        }
        a.setStatus("SUSPENSO");
    }

    @Override
    @Transactional
    public void reativar(UUID id) {
        Arbitro a = buscar(id);
        if (!"SUSPENSO".equals(a.getStatus())) {
            throw new WebApplicationException("Apenas árbitros suspensos podem ser reativados", 409);
        }
        a.setStatus("CREDENCIADO");
    }

    // --------------------- helpers ---------------------

    private Arbitro buscar(UUID id) {
        return arbitroRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Árbitro não encontrado", 404));
    }

    private String upload(String tipo, FileUpload file) {
        if (file == null || file.size() == 0) {
            return null;
        }
        String nome = file.fileName() != null ? file.fileName() : tipo;
        String key = "arbitros/" + UUID.randomUUID() + "/" + tipo + "-" + nome;
        return r2.upload(key, file);
    }

    private boolean parseBool(String s) {
        return "true".equalsIgnoreCase(s);
    }

    private LocalDate parseData(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(s);
        } catch (Exception e) {
            throw new WebApplicationException("Data de nascimento inválida", 400);
        }
    }
}
