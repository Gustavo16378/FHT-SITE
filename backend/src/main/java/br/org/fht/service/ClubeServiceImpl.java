package br.org.fht.service;

import br.org.fht.common.Escopo;
import br.org.fht.dto.clube.AtletaVitrineDTO;
import br.org.fht.dto.clube.ClubeForm;
import br.org.fht.dto.clube.ClubeResponseDTO;
import br.org.fht.dto.clube.ClubeUpdateForm;
import br.org.fht.dto.clube.ClubeVitrineDTO;
import br.org.fht.dto.clube.ClubeVitrineDetalheDTO;
import br.org.fht.mapper.ClubeMapper;
import br.org.fht.model.Atleta;
import br.org.fht.model.Clube;
import br.org.fht.model.Role;
import br.org.fht.model.Usuario;
import br.org.fht.repository.AtletaRepository;
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
