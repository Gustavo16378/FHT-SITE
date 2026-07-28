package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.arbitro.ArbitroForm;
import br.org.fht.dto.arbitro.ArbitroResponseDTO;
import br.org.fht.service.ArbitroService;
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

@Path("/api/arbitros")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Árbitros", description = "Corpo arbitral: solicitação pública e credenciamento pela FHT")
public class ArbitroResource {

    @Inject ArbitroService arbitroService;

    @POST
    @Path("/solicitar")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Solicitar cadastro de árbitro",
            description = "Endpoint público (formulário 'Quero ser árbitro'). Cria com status PENDENTE.")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Solicitação enviada"),
            @APIResponse(responseCode = "400", description = "Dados inválidos")
    })
    public Response solicitar(@BeanParam ArbitroForm form) {
        ArbitroResponseDTO a = arbitroService.solicitar(form);
        return Response.status(201)
                .entity(ApiResponse.created(a, "Solicitação enviada. A FHT entrará em contato em breve."))
                .build();
    }

    @GET
    @Path("/publico")
    @Operation(summary = "Árbitros credenciados (vitrine pública)",
            description = "Endpoint público. Só credenciados, com dados públicos (nome, cidade, nível, foto).")
    @APIResponse(responseCode = "200", description = "Árbitros credenciados")
    public Response listarPublicos() {
        return Response.ok(ApiResponse.ok(arbitroService.listarPublicos(), "OK")).build();
    }

    @GET
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Listar todos os árbitros (admin)")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Lista de árbitros"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response listar() {
        return Response.ok(ApiResponse.ok(arbitroService.listar(), "OK")).build();
    }

    @PATCH
    @Path("/{id}/credenciar")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Credenciar árbitro", description = "Muda status para CREDENCIADO e define o nível.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Árbitro credenciado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Árbitro não encontrado"),
            @APIResponse(responseCode = "409", description = "Árbitro já credenciado")
    })
    public Response credenciar(
            @Parameter(description = "UUID do árbitro", required = true) @PathParam("id") UUID id,
            CredenciarRequest req) {
        arbitroService.credenciar(id, req != null ? req.nivel() : null);
        return Response.ok(ApiResponse.ok(null, "Árbitro credenciado")).build();
    }

    @PATCH
    @Path("/{id}/rejeitar")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Rejeitar solicitação de árbitro")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Árbitro rejeitado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Árbitro não encontrado")
    })
    public Response rejeitar(
            @Parameter(description = "UUID do árbitro", required = true) @PathParam("id") UUID id,
            MotivoRequest req) {
        arbitroService.rejeitar(id, req != null ? req.motivo() : null);
        return Response.ok(ApiResponse.ok(null, "Árbitro rejeitado")).build();
    }

    @PATCH
    @Path("/{id}/suspender")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Suspender árbitro", description = "Muda status de CREDENCIADO para SUSPENSO.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Árbitro suspenso"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Árbitro não encontrado"),
            @APIResponse(responseCode = "409", description = "Árbitro não está credenciado")
    })
    public Response suspender(
            @Parameter(description = "UUID do árbitro", required = true) @PathParam("id") UUID id) {
        arbitroService.suspender(id);
        return Response.ok(ApiResponse.ok(null, "Árbitro suspenso")).build();
    }

    @PATCH
    @Path("/{id}/reativar")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reativar árbitro", description = "Muda status de SUSPENSO de volta para CREDENCIADO.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Árbitro reativado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Árbitro não encontrado"),
            @APIResponse(responseCode = "409", description = "Árbitro não está suspenso")
    })
    public Response reativar(
            @Parameter(description = "UUID do árbitro", required = true) @PathParam("id") UUID id) {
        arbitroService.reativar(id);
        return Response.ok(ApiResponse.ok(null, "Árbitro reativado")).build();
    }

    @Schema(description = "Nível a atribuir ao credenciar")
    public record CredenciarRequest(
            @Schema(enumeration = {"Regional", "Estadual B", "Estadual A", "Nacional"}) String nivel
    ) {}

    @Schema(description = "Motivo da rejeição")
    public record MotivoRequest(String motivo) {}
}
