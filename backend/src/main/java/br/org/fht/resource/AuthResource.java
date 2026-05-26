package br.org.fht.resource;

import br.org.fht.dto.auth.LoginRequest;
import br.org.fht.dto.auth.LoginResponseDTO;
import br.org.fht.dto.auth.RefreshRequest;
import br.org.fht.common.ApiResponse;
import br.org.fht.model.Role;
import br.org.fht.model.Usuario;
import br.org.fht.repository.UsuarioRepository;
import br.org.fht.service.JwtService;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.auth.principal.JWTParser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Autenticação", description = "Login, refresh token e gestão de usuários")
public class AuthResource {

    @Inject UsuarioRepository usuarioRepository;
    @Inject JwtService jwtService;
    @Inject JWTParser jwtParser;

    @POST
    @Path("/login")
    @Operation(summary = "Realizar login", description = "Autentica o usuário e retorna access token + refresh token JWT.")
    @RequestBody(description = "Credenciais de acesso", required = true,
            content = @Content(mediaType = MediaType.APPLICATION_JSON,
                    schema = @Schema(implementation = LoginRequest.class)))
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Login realizado — retorna token, refreshToken e role"),
            @APIResponse(responseCode = "400", description = "Corpo inválido"),
            @APIResponse(responseCode = "401", description = "Credenciais inválidas"),
            @APIResponse(responseCode = "403", description = "Usuário inativo")
    })
    public Response login(@Valid LoginRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(req.email())
                .orElseThrow(() -> new WebApplicationException("Credenciais inválidas", 401));

        if (!usuario.isAtivo()) {
            throw new WebApplicationException("Usuário inativo", 403);
        }
        if (!BcryptUtil.matches(req.senha(), usuario.getSenhaHash())) {
            throw new WebApplicationException("Credenciais inválidas", 401);
        }

        String token = jwtService.generateToken(usuario);
        String refreshToken = jwtService.generateRefreshToken(usuario);

        return Response.ok(ApiResponse.ok(
                new LoginResponseDTO(token, refreshToken, usuario.getRole().name()),
                "Login realizado com sucesso"
        )).build();
    }

    @POST
    @Path("/refresh")
    @Operation(summary = "Renovar access token")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Novo access token gerado"),
            @APIResponse(responseCode = "401", description = "Refresh token inválido ou expirado")
    })
    public Response refresh(@Valid RefreshRequest req) {
        try {
            var parsed = jwtParser.parse(req.refreshToken());
            String type = parsed.getClaim("type");
            if (!"refresh".equals(type)) {
                throw new WebApplicationException("Token inválido", 401);
            }
            Usuario usuario = usuarioRepository.findByEmail(parsed.getName())
                    .orElseThrow(() -> new WebApplicationException("Usuário não encontrado", 404));

            return Response.ok(ApiResponse.ok(
                    new LoginResponseDTO(jwtService.generateToken(usuario), null, usuario.getRole().name()),
                    "Token renovado"
            )).build();
        } catch (WebApplicationException e) {
            throw e;
        } catch (Exception e) {
            throw new WebApplicationException("Refresh token inválido ou expirado", 401);
        }
    }

    @POST
    @Path("/usuarios")
    @jakarta.annotation.security.RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Criar usuário ADMIN_CLUBE")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Usuário criado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "409", description = "E-mail já cadastrado")
    })
    public Response criarUsuarioClube(CriarUsuarioRequest req) {
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
                .entity(ApiResponse.created(null, "Usuário criado com sucesso"))
                .build();
    }

    @Schema(description = "Dados para criação de usuário ADMIN_CLUBE")
    public record CriarUsuarioRequest(
            @Schema(description = "Nome completo", example = "João da Silva") String nome,
            @Schema(description = "E-mail de acesso", example = "joao@clube.to") String email,
            @Schema(description = "Senha inicial", example = "Temp@2025") String senha,
            @Schema(description = "UUID do clube vinculado") UUID clubeId
    ) {}
}
