package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.galeria.FotoForm;
import br.org.fht.dto.galeria.ImagemForm;
import br.org.fht.service.GaleriaService;
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

@Path("/api/galeria")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Galeria", description = "Vitrine pública de fotos (\"Momentos que ficam\")")
public class GaleriaResource {

    @Inject GaleriaService galeriaService;

    @GET
    @Operation(summary = "Listar fotos da galeria",
            description = "Endpoint público. Todas as fotos, mais recentes primeiro.")
    @APIResponse(responseCode = "200", description = "Fotos da galeria")
    public Response listar() {
        return Response.ok(ApiResponse.ok(galeriaService.listar(), "OK")).build();
    }

    @POST
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Adicionar foto à galeria")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Foto adicionada"),
            @APIResponse(responseCode = "400", description = "Dados inválidos"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response criar(FotoForm form) {
        var foto = galeriaService.criar(form);
        return Response.status(201).entity(ApiResponse.created(foto, "Foto adicionada")).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Editar foto da galeria")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Foto atualizada"),
            @APIResponse(responseCode = "400", description = "Dados inválidos"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Foto não encontrada")
    })
    public Response atualizar(
            @Parameter(description = "UUID da foto", required = true) @PathParam("id") UUID id,
            FotoForm form) {
        return Response.ok(ApiResponse.ok(galeriaService.atualizar(id, form), "Foto atualizada")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Deletar foto da galeria")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Foto deletada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Foto não encontrada")
    })
    public Response deletar(
            @Parameter(description = "UUID da foto", required = true) @PathParam("id") UUID id) {
        galeriaService.deletar(id);
        return Response.ok(ApiResponse.ok(null, "Foto deletada")).build();
    }

    @POST
    @Path("/upload-imagem")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Subir imagem da galeria",
            description = "Faz upload e devolve a URL para salvar na foto. Usa storage local em dev (sem R2).")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Imagem enviada — retorna a URL"),
            @APIResponse(responseCode = "400", description = "Arquivo ausente ou inválido"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response uploadImagem(@BeanParam ImagemForm form) {
        String url = galeriaService.uploadImagem(form.file);
        return Response.ok(ApiResponse.ok(new UploadResponse(url), "Imagem enviada")).build();
    }

    @Schema(description = "URL do arquivo enviado")
    public record UploadResponse(
            @Schema(description = "URL para usar em imagemUrl") String url
    ) {}
}
