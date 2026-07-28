package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.institucional.DiretorForm;
import br.org.fht.dto.institucional.ImagemForm;
import br.org.fht.service.DiretorService;
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

@Path("/api/diretores")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Diretoria", description = "Membros da diretoria da FHT (institucional)")
public class DiretorResource {

    @Inject DiretorService diretorService;

    @GET
    @Operation(summary = "Listar diretoria", description = "Endpoint público. Diretoria ordenada.")
    @APIResponse(responseCode = "200", description = "Membros da diretoria")
    public Response listar() {
        return Response.ok(ApiResponse.ok(diretorService.listar(), "OK")).build();
    }

    @POST
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Adicionar membro da diretoria")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Membro adicionado"),
            @APIResponse(responseCode = "400", description = "Dados inválidos"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response criar(DiretorForm form) {
        var d = diretorService.criar(form);
        return Response.status(201).entity(ApiResponse.created(d, "Membro adicionado")).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Editar membro da diretoria")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Membro atualizado"),
            @APIResponse(responseCode = "400", description = "Dados inválidos"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Diretor não encontrado")
    })
    public Response atualizar(
            @Parameter(description = "UUID do diretor", required = true) @PathParam("id") UUID id,
            DiretorForm form) {
        return Response.ok(ApiResponse.ok(diretorService.atualizar(id, form), "Membro atualizado")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Remover membro da diretoria")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Membro removido"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Diretor não encontrado")
    })
    public Response deletar(
            @Parameter(description = "UUID do diretor", required = true) @PathParam("id") UUID id) {
        diretorService.deletar(id);
        return Response.ok(ApiResponse.ok(null, "Membro removido")).build();
    }

    @POST
    @Path("/upload-foto")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Subir foto do diretor",
            description = "Faz upload e devolve a URL para salvar no diretor. Storage local em dev (sem R2).")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Foto enviada — retorna a URL"),
            @APIResponse(responseCode = "400", description = "Arquivo ausente ou inválido"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response uploadFoto(@BeanParam ImagemForm form) {
        String url = diretorService.uploadFoto(form.file);
        return Response.ok(ApiResponse.ok(new UploadResponse(url), "Foto enviada")).build();
    }

    @Schema(description = "URL do arquivo enviado")
    public record UploadResponse(
            @Schema(description = "URL para usar em fotoUrl") String url
    ) {}
}
