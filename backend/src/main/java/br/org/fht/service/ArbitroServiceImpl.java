package br.org.fht.service;

import br.org.fht.dto.arbitro.ArbitroForm;
import br.org.fht.exception.ValidationException;
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
    public ArbitroResponseDTO cadastrar(ArbitroForm form) {
        if (form == null || form.nomeCompleto == null || form.nomeCompleto.isBlank()) {
            throw new ValidationException("nomeCompleto", "Nome é obrigatório");
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

        a.setNivel(form.nivel);
        a.setRegistro(form.registro);
        a.setInicioArbitragem(form.inicioArbitragem);
        a.setFormacao(form.formacao);

        a.setFotoUrl(upload("foto", form.foto));
        a.setRgUrl(upload("rg", form.rgDoc));

        // Quem cadastra é a própria comissão de arbitragem — não há o que aprovar.
        a.setStatus("CREDENCIADO");
        arbitroRepository.persist(a);
        return ArbitroMapper.toResponse(a);
    }

    @Override
    @Transactional
    public ArbitroResponseDTO atualizar(UUID id, ArbitroForm form) {
        Arbitro a = buscar(id);
        if (form == null) {
            throw new ValidationException("form", "Dados do árbitro ausentes");
        }

        // Atualização parcial: só sobrescreve o que veio preenchido.
        if (naoBranco(form.nomeCompleto)) a.setNome(form.nomeCompleto.trim());
        if (form.cpf != null) a.setCpf(form.cpf);
        if (form.rg != null) a.setRg(form.rg);
        if (form.orgaoEmissor != null) a.setOrgaoEmissor(form.orgaoEmissor);
        if (naoBranco(form.dataNascimento)) a.setDataNascimento(parseData(form.dataNascimento));
        if (form.sexo != null) a.setSexo(form.sexo);
        if (form.telefone != null) a.setTelefone(form.telefone);
        if (form.email != null) a.setEmail(form.email);
        if (form.cidade != null) a.setCidade(form.cidade);
        if (naoBranco(form.uf)) a.setUf(form.uf);
        if (form.nivel != null) a.setNivel(form.nivel);
        if (form.registro != null) a.setRegistro(form.registro);
        if (form.inicioArbitragem != null) a.setInicioArbitragem(form.inicioArbitragem);
        if (form.formacao != null) a.setFormacao(form.formacao);

        // Arquivo só é trocado quando um novo é enviado — não apaga o que já existe.
        String foto = upload("foto", form.foto);
        if (foto != null) a.setFotoUrl(foto);
        String rgDoc = upload("rg", form.rgDoc);
        if (rgDoc != null) a.setRgUrl(rgDoc);

        return ArbitroMapper.toResponse(a);
    }

    @Override
    @Transactional
    public void deletar(UUID id) {
        arbitroRepository.delete(buscar(id));
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

    private boolean naoBranco(String s) {
        return s != null && !s.isBlank();
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
