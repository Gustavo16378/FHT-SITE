package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.model.Role;
import br.org.fht.model.Usuario;
import br.org.fht.repository.AtletaRepository;
import br.org.fht.repository.ClubeRepository;
import br.org.fht.repository.UsuarioRepository;
import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;
import java.util.UUID;

@Path("/api/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN_FHT")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Admin FHT", description = "Operações exclusivas do administrador da federação")
public class AdminResource {

    @Inject ClubeRepository clubeRepository;
    @Inject AtletaRepository atletaRepository;
    @Inject UsuarioRepository usuarioRepository;

    @GET
    @Path("/dashboard")
    @Operation(summary = "Totais do dashboard admin",
            description = "Retorna contadores de clubes, atletas e usuários para o painel administrativo.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Dados do dashboard"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response dashboard() {
        return Response.ok(ApiResponse.ok(Map.of(
                "clubes", Map.of(
                        "total", clubeRepository.count(),
                        "pendentes", clubeRepository.count("status", "PENDENTE"),
                        "ativos", clubeRepository.count("status", "ATIVO")),
                "atletas", Map.of(
                        "total", atletaRepository.count(),
                        "pendentes", atletaRepository.count("status", "AGUARDANDO_PAGAMENTO"),
                        "ativos", atletaRepository.count("status", "ATIVO")),
                "usuarios", usuarioRepository.count()
        ), "OK")).build();
    }

    @POST
    @Path("/usuarios")
    @Transactional
    @Operation(summary = "Criar usuário ADMIN_CLUBE manualmente")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Usuário criado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "409", description = "E-mail já cadastrado")
    })
    public Response criarUsuario(@Valid CriarUsuarioRequest req) {
        if (usuarioRepository.existsByEmail(req.email())) {
            throw new WebApplicationException("E-mail já cadastrado", 409);
        }

        var usuario = new Usuario();
        usuario.setNome(req.nome());
        usuario.setEmail(req.email());
        usuario.setSenhaHash(BcryptUtil.bcryptHash(req.senha()));
        usuario.setRole(Role.ADMIN_CLUBE);
        usuario.setClubeId(req.clubeId());
        usuarioRepository.persist(usuario);

        return Response.status(201)
                .entity(ApiResponse.created(Map.of("id", usuario.getId()), "Usuário criado"))
                .build();
    }

    @Schema(description = "Dados para criação de usuário ADMIN_CLUBE")
    public record CriarUsuarioRequest(
            @NotBlank @Schema(description = "Nome completo", example = "Maria Oliveira") String nome,
            @NotBlank @Email @Schema(description = "E-mail de acesso", example = "maria@clube.to") String email,
            @NotBlank @Schema(description = "Senha inicial", example = "Senha@2025") String senha,
            @Schema(description = "UUID do clube vinculado") UUID clubeId
    ) {}
}
