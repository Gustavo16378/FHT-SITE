package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.atleta.AtletaForm;
import br.org.fht.dto.atleta.AtletaResponseDTO;
import br.org.fht.service.AtletaService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/atletas")
@Produces(MediaType.APPLICATION_JSON)
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Atletas", description = "Cadastro, aprovação e gestão de atletas filiados")
public class AtletaResource {

    @Inject AtletaService atletaService;
    @Inject JsonWebToken jwt;

    @POST
    @RolesAllowed("ADMIN_CLUBE")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Cadastrar atleta",
            description = "Cadastra um novo atleta no clube do usuário autenticado. Envia foto, RG, comprovante de residência e Pix.")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Atleta cadastrado — status AGUARDANDO_PAGAMENTO"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_CLUBE"),
            @APIResponse(responseCode = "409", description = "CPF já cadastrado"),
            @APIResponse(responseCode = "422", description = "CPF inválido")
    })
    public Response cadastrar(@BeanParam AtletaForm form) {
        AtletaResponseDTO atleta = atletaService.cadastrar(form, jwt);
        return Response.status(201)
                .entity(ApiResponse.created(atleta, "Atleta cadastrado com sucesso"))
                .build();
    }

    @GET
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @Operation(summary = "Listar atletas",
            description = "ADMIN_FHT vê todos. ADMIN_CLUBE vê apenas os do próprio clube.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Lista de atletas"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido")
    })
    public Response listar() {
        List<AtletaResponseDTO> atletas = atletaService.listar(jwt);
        return Response.ok(ApiResponse.ok(atletas, "OK")).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @Operation(summary = "Buscar atleta por ID")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Dados do atleta"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Sem permissão"),
            @APIResponse(responseCode = "404", description = "Atleta não encontrado")
    })
    public Response buscarPorId(
            @Parameter(description = "UUID do atleta", required = true) @PathParam("id") UUID id) {
        return Response.ok(ApiResponse.ok(atletaService.buscarPorId(id, jwt), "OK")).build();
    }

    @PATCH
    @Path("/{id}/aprovar")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Aprovar atleta",
            description = "Muda status para ATIVO. Exige comprovante de pagamento Pix — retorna 422 se ausente.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Atleta aprovado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Atleta não encontrado"),
            @APIResponse(responseCode = "422", description = "Comprovante de pagamento não enviado")
    })
    public Response aprovar(
            @Parameter(description = "UUID do atleta", required = true) @PathParam("id") UUID id) {
        atletaService.aprovar(id);
        return Response.ok(ApiResponse.ok(null, "Atleta aprovado com sucesso")).build();
    }

    @PATCH
    @Path("/{id}/rejeitar")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Rejeitar cadastro de atleta")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Atleta rejeitado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Atleta não encontrado")
    })
    public Response rejeitar(
            @Parameter(description = "UUID do atleta", required = true) @PathParam("id") UUID id,
            MotivoRequest req) {
        atletaService.rejeitar(id, req != null ? req.motivo() : null);
        return Response.ok(ApiResponse.ok(null, "Atleta rejeitado")).build();
    }

    @PATCH
    @Path("/{id}/suspender")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Suspender atleta", description = "Muda status de ATIVO para SUSPENSO.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Atleta suspenso"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Atleta não encontrado"),
            @APIResponse(responseCode = "409", description = "Atleta não está ativo")
    })
    public Response suspender(
            @Parameter(description = "UUID do atleta", required = true) @PathParam("id") UUID id) {
        atletaService.suspender(id);
        return Response.ok(ApiResponse.ok(null, "Atleta suspenso")).build();
    }

    @PATCH
    @Path("/{id}/reativar")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Reativar atleta", description = "Muda status de SUSPENSO de volta para ATIVO.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Atleta reativado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Atleta não encontrado"),
            @APIResponse(responseCode = "409", description = "Atleta não está suspenso")
    })
    public Response reativar(
            @Parameter(description = "UUID do atleta", required = true) @PathParam("id") UUID id) {
        atletaService.reativar(id);
        return Response.ok(ApiResponse.ok(null, "Atleta reativado")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @Operation(summary = "Deletar atleta", description = "Remove permanentemente o cadastro do atleta.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Atleta removido"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Atleta não encontrado")
    })
    public Response deletar(
            @Parameter(description = "UUID do atleta", required = true) @PathParam("id") UUID id) {
        atletaService.deletar(id);
        return Response.ok(ApiResponse.ok(null, "Atleta removido")).build();
    }

    @Schema(description = "Motivo da rejeição")
    public record MotivoRequest(
            @Schema(description = "Texto explicando o motivo", example = "Foto ilegível")
            String motivo
    ) {}
}
