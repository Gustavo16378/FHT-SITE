package br.org.fht.service;

import br.org.fht.common.CPFValidator;
import br.org.fht.dto.atleta.AtletaForm;
import br.org.fht.dto.atleta.AtletaResponseDTO;
import br.org.fht.dto.atleta.AtletaUpdateForm;
import br.org.fht.exception.ValidationException;
import br.org.fht.mapper.AtletaMapper;
import br.org.fht.model.Atleta;
import br.org.fht.repository.AtletaRepository;
import br.org.fht.repository.ClubeRepository;
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AtletaServiceImpl implements AtletaService {

    @Inject AtletaRepository atletaRepository;
    @Inject ClubeRepository clubeRepository;
    @Inject R2StorageService r2;

    @Override
    @Transactional
    public AtletaResponseDTO cadastrar(AtletaForm form, JsonWebToken jwt) {
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

        var atleta = new Atleta();
        atleta.setClubeId(clubeId);
        atleta.setNomeCompleto(form.nomeCompleto);
        atleta.setDataNascimento(LocalDate.parse(form.dataNascimento));
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

        String baseKey = "atletas/" + clubeId + "/" + UUID.randomUUID();

        if (form.foto != null && form.foto.size() > 0) {
            atleta.setFotoUrl(r2.upload(baseKey + "/foto_" + form.foto.fileName(), form.foto));
        }
        if (form.rgDoc != null && form.rgDoc.size() > 0) {
            atleta.setRgUrl(r2.upload(baseKey + "/rg_" + form.rgDoc.fileName(), form.rgDoc));
        }
        if (form.comprovanteResidencia != null && form.comprovanteResidencia.size() > 0) {
            atleta.setComprovanteResidenciaUrl(r2.upload(baseKey + "/res_" + form.comprovanteResidencia.fileName(), form.comprovanteResidencia));
        }
        if (form.comprovantePix != null && form.comprovantePix.size() > 0) {
            atleta.setComprovantePagamentoUrl(r2.upload(baseKey + "/pix_" + form.comprovantePix.fileName(), form.comprovantePix));
        }

        atletaRepository.persist(atleta);
        return AtletaMapper.toResponse(atleta);
    }

    @Override
    public List<AtletaResponseDTO> listar(JsonWebToken jwt) {
        String role = jwt.getClaim("role");
        if ("ADMIN_CLUBE".equals(role)) {
            UUID clubeId = UUID.fromString((String) jwt.getClaim("clubeId"));
            return atletaRepository.findByClubeId(clubeId)
                    .stream().map(AtletaMapper::toResponse).toList();
        }
        return atletaRepository.listAllOrdered()
                .stream().map(AtletaMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public AtletaResponseDTO atualizar(UUID id, AtletaUpdateForm form, JsonWebToken jwt) {
        // Escopo: ADMIN_CLUBE só edita atleta do próprio clube; ADMIN_FHT edita qualquer um.
        Atleta atleta;
        if ("ADMIN_CLUBE".equals((String) jwt.getClaim("role"))) {
            UUID clubeId = UUID.fromString((String) jwt.getClaim("clubeId"));
            atleta = atletaRepository.findByClubeIdAndId(clubeId, id)
                    .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
        } else {
            atleta = atletaRepository.findByIdOptional(id)
                    .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
        }

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

        // entidade managed + @Transactional → dirty checking persiste no commit
        return AtletaMapper.toResponse(atleta);
    }

    @Override
    public AtletaResponseDTO buscarPorId(UUID id, JsonWebToken jwt) {
        String role = jwt.getClaim("role");
        if ("ADMIN_CLUBE".equals(role)) {
            UUID clubeId = UUID.fromString((String) jwt.getClaim("clubeId"));
            return atletaRepository.findByClubeIdAndId(clubeId, id)
                    .map(AtletaMapper::toResponse)
                    .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
        }
        return atletaRepository.findByIdOptional(id)
                .map(AtletaMapper::toResponse)
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

        atleta.setStatus("ATIVO");
        atleta.setMotivoRejeicao(null);
    }

    @Override
    @Transactional
    public void rejeitar(UUID id, String motivo) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));

        atleta.setStatus("REJEITADO");
        atleta.setMotivoRejeicao(motivo);
    }

    @Override
    @Transactional
    public void suspender(UUID id) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));

        if (!"ATIVO".equals(atleta.getStatus())) {
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

        atleta.setStatus("ATIVO");
    }

    @Override
    @Transactional
    public void deletar(UUID id) {
        Atleta atleta = atletaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Atleta não encontrado", 404));
        atletaRepository.delete(atleta);
    }
}
