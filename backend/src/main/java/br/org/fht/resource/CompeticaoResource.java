package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.competicao.CompeticaoForm;
import br.org.fht.dto.competicao.CompeticaoResponseDTO;
import br.org.fht.service.CompeticaoService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

/**
 * Competicoes da FHT. Os caminhos literais (/publico) sao declarados ANTES dos
 * path params para nao competirem com /{id} — o mesmo cuidado que Noticias precisou ter.
 */
@Path("/api/competicoes")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Competições", description = "Campeonatos, copas e festivais organizados pela FHT")
public class CompeticaoResource {

    @Inject CompeticaoService competicaoService;

    /* ───────────────────────── público ───────────────────────── */

    @GET
    @Path("/publico")
    @Operation(summary = "Competições da vitrine pública",
            description = "Endpoint público. Só as marcadas como visíveis na home e não canceladas.")
    @APIResponse(responseCode = "200", description = "Competições visíveis")
    public Response listarPublicas() {
        return Response.ok(ApiResponse.ok(competicaoService.listarPublicas(), "OK")).build();
    }

    @GET
    @Path("/publico/{id}")
    @Operation(summary = "Detalhe público da competição",
            description = "Endpoint público. Equipes, jogos e classificação entram na próxima etapa do módulo.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Dados da competição"),
            @APIResponse(responseCode = "404", description = "Competição não encontrada ou não visível")
    })
    public Response buscarPublica(
            @Parameter(description = "UUID da competição", required = true) @PathParam("id") UUID id) {
        return Response.ok(ApiResponse.ok(competicaoService.buscarPublicaPorId(id), "OK")).build();
    }

    /* ───────────────────────── admin ───────────────────────── */

    @POST
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Criar competição",
            description = "O status não é informado: nasce derivado das datas. Use os PATCHs de ciclo de vida para sobrepor.")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Competição criada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "422", description = "Dados inválidos")
    })
    public Response criar(CompeticaoForm form) {
        CompeticaoResponseDTO c = competicaoService.criar(form);
        return Response.status(201).entity(ApiResponse.created(c, "Competição criada")).build();
    }

    @GET
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Listar competições (admin)")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Lista de competições"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response listar() {
        return Response.ok(ApiResponse.ok(competicaoService.listar(), "OK")).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Buscar competição por ID (admin)")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Dados da competição"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Competição não encontrada")
    })
    public Response buscarPorId(
            @Parameter(description = "UUID da competição", required = true) @PathParam("id") UUID id) {
        return Response.ok(ApiResponse.ok(competicaoService.buscarPorId(id), "OK")).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Editar competição", description = "Atualização parcial: campos nulos são ignorados.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Competição atualizada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Competição não encontrada"),
            @APIResponse(responseCode = "422", description = "Dados inválidos")
    })
    public Response atualizar(
            @Parameter(description = "UUID da competição", required = true) @PathParam("id") UUID id,
            CompeticaoForm form) {
        return Response.ok(ApiResponse.ok(competicaoService.atualizar(id, form), "Competição atualizada")).build();
    }

    @PATCH
    @Path("/{id}/status")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Definir status manualmente",
            description = "Sobrepõe o status derivado das datas. Usado por abrir inscrições, iniciar, encerrar, adiar e cancelar.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Status definido"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Competição não encontrada"),
            @APIResponse(responseCode = "422", description = "Status inválido")
    })
    public Response definirStatus(
            @Parameter(description = "UUID da competição", required = true) @PathParam("id") UUID id,
            StatusRequest req) {
        return Response.ok(ApiResponse.ok(
                competicaoService.definirStatus(id, req != null ? req.status() : null), "Status atualizado")).build();
    }

    @PATCH
    @Path("/{id}/status-automatico")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Voltar ao status automático",
            description = "Remove o override manual — o status volta a ser derivado das datas.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Status voltou ao automático"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Competição não encontrada")
    })
    public Response voltarStatusAutomatico(
            @Parameter(description = "UUID da competição", required = true) @PathParam("id") UUID id) {
        return Response.ok(ApiResponse.ok(
                competicaoService.voltarStatusAutomatico(id), "Status voltou a ser automático")).build();
    }

    @PATCH
    @Path("/{id}/vitrine")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Mostrar/ocultar a competição na home")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Visibilidade atualizada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Competição não encontrada")
    })
    public Response definirVitrine(
            @Parameter(description = "UUID da competição", required = true) @PathParam("id") UUID id,
            VitrineRequest req) {
        boolean visivel = req == null || req.visivel() == null || req.visivel();
        return Response.ok(ApiResponse.ok(
                competicaoService.definirVitrine(id, visivel), "Visibilidade atualizada")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Deletar competição")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Competição removida"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Competição não encontrada")
    })
    public Response deletar(
            @Parameter(description = "UUID da competição", required = true) @PathParam("id") UUID id) {
        competicaoService.deletar(id);
        return Response.ok(ApiResponse.ok(null, "Competição removida")).build();
    }

    @Schema(description = "Status manual a aplicar")
    public record StatusRequest(
            @Schema(enumeration = {"INSCRICOES_ABERTAS", "EM_ANDAMENTO", "ENCERRADO", "ADIADO", "CANCELADO"})
            String status
    ) {}

    @Schema(description = "Visibilidade na home")
    public record VitrineRequest(Boolean visivel) {}
}
