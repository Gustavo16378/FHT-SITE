package br.org.fht.service;

import br.org.fht.dto.clube.ClubeForm;
import br.org.fht.dto.clube.ClubeResponseDTO;
import br.org.fht.dto.clube.ClubeUpdateForm;
import br.org.fht.mapper.ClubeMapper;
import br.org.fht.model.Clube;
import br.org.fht.model.Role;
import br.org.fht.model.Usuario;
import br.org.fht.repository.ClubeRepository;
import br.org.fht.repository.UsuarioRepository;
import br.org.fht.storage.R2StorageService;
import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ClubeServiceImpl implements ClubeService {

    @Inject ClubeRepository clubeRepository;
    @Inject UsuarioRepository usuarioRepository;
    @Inject R2StorageService r2;

    @Override
    @Transactional
    public ClubeResponseDTO solicitar(ClubeForm form) {
        var clube = new Clube();
        clube.setNome(form.nome);
        clube.setCidade(form.cidade);
        clube.setUf(form.uf != null ? form.uf : "TO");
        clube.setSigla(form.sigla);
        clube.setCnpj(form.cnpj);
        clube.setRepresentanteNome(form.representanteNome);
        clube.setRepresentanteEmail(form.representanteEmail);
        clube.setRepresentanteTelefone(form.representanteTelefone);
        clube.setRepresentanteCargo(form.representanteCargo);

        if (form.ata != null && form.ata.size() > 0) {
            String key = "clubes/" + UUID.randomUUID() + "/" + form.ata.fileName();
            clube.setAtaFundacaoUrl(r2.upload(key, form.ata));
        }
        if (form.estatuto != null && form.estatuto.size() > 0) {
            String key = "clubes/" + UUID.randomUUID() + "/" + form.estatuto.fileName();
            clube.setEstatutoUrl(r2.upload(key, form.estatuto));
        }

        clubeRepository.persist(clube);
        return ClubeMapper.toResponse(clube);
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

        String role = jwt.getClaim("role");
        if ("ADMIN_CLUBE".equals(role)) {
            String clubeIdJwt = jwt.getClaim("clubeId");
            if (!id.toString().equals(clubeIdJwt)) {
                throw new WebApplicationException("Acesso negado", 403);
            }
        }

        return ClubeMapper.toResponse(clube);
    }

    @Override
    @Transactional
    public ClubeResponseDTO atualizar(UUID id, ClubeUpdateForm form, JsonWebToken jwt) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        // Escopo: ADMIN_CLUBE só edita o próprio clube; ADMIN_FHT edita qualquer um.
        if ("ADMIN_CLUBE".equals((String) jwt.getClaim("role"))) {
            String clubeIdJwt = jwt.getClaim("clubeId");
            if (!id.toString().equals(clubeIdJwt)) {
                throw new WebApplicationException("Acesso negado", 403);
            }
        }

        // Atualização parcial — não mexe em status, documentos nem filiação.
        if (form.nome() != null) clube.setNome(form.nome());
        if (form.cidade() != null) clube.setCidade(form.cidade());
        if (form.uf() != null) clube.setUf(form.uf());
        if (form.sigla() != null) clube.setSigla(form.sigla());
        if (form.cnpj() != null) clube.setCnpj(form.cnpj());
        if (form.representanteNome() != null) clube.setRepresentanteNome(form.representanteNome());
        if (form.representanteEmail() != null) clube.setRepresentanteEmail(form.representanteEmail());
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

        if (!usuarioRepository.existsByEmail(clube.getRepresentanteEmail())) {
            String senhaTemporaria = UUID.randomUUID().toString().substring(0, 8);
            var usuario = new Usuario();
            usuario.setNome(clube.getRepresentanteNome());
            usuario.setEmail(clube.getRepresentanteEmail());
            usuario.setSenhaHash(BcryptUtil.bcryptHash(senhaTemporaria));
            usuario.setRole(Role.ADMIN_CLUBE);
            usuario.setClubeId(clube.getId());
            usuarioRepository.persist(usuario);
        }
    }

    @Override
    @Transactional
    public void rejeitar(UUID id, String motivo) {
        Clube clube = clubeRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Clube não encontrado", 404));

        clube.setStatus("REJEITADO");
        clube.setMotivoRejeicao(motivo);
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
    }
}
