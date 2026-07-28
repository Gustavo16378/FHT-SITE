package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.institucional.DocumentoForm;
import br.org.fht.dto.institucional.ImagemForm;
import br.org.fht.service.DocumentoService;
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

import java.util.UUID;

@Path("/api/documentos")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Documentos", description = "Documentos institucionais (transparência) — públicos")
public class DocumentoResource {

    @Inject DocumentoService documentoService;
    @Inject JsonWebToken jwt;

    @GET
    @Operation(summary = "Listar documentos", description = "Endpoint público. Filtro opcional por categoria.")
    @APIResponse(responseCode = "200", description = "Documentos")
    public Response listar(
            @Parameter(description = "Filtrar por categoria") @QueryParam("categoria") String categoria) {
        return Response.ok(ApiResponse.ok(documentoService.listar(categoria), "OK")).build();
    }

    @POST
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Publicar documento")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Documento publicado"),
            @APIResponse(responseCode = "400", description = "Dados inválidos"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response criar(DocumentoForm form) {
        var d = documentoService.criar(form, jwt);
        return Response.status(201).entity(ApiResponse.created(d, "Documento publicado")).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Editar documento")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Documento atualizado"),
            @APIResponse(responseCode = "400", description = "Dados inválidos"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Documento não encontrado")
    })
    public Response atualizar(
            @Parameter(description = "UUID do documento", required = true) @PathParam("id") UUID id,
            DocumentoForm form) {
        return Response.ok(ApiResponse.ok(documentoService.atualizar(id, form), "Documento atualizado")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Deletar documento")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Documento deletado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Documento não encontrado")
    })
    public Response deletar(
            @Parameter(description = "UUID do documento", required = true) @PathParam("id") UUID id) {
        documentoService.deletar(id);
        return Response.ok(ApiResponse.ok(null, "Documento deletado")).build();
    }

    @POST
    @Path("/upload-arquivo")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Subir PDF do documento",
            description = "Faz upload e devolve a URL + tamanho para salvar no documento. Storage local em dev (sem R2).")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Arquivo enviado — retorna a URL e o tamanho"),
            @APIResponse(responseCode = "400", description = "Arquivo ausente ou inválido"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response uploadArquivo(@BeanParam ImagemForm form) {
        var res = documentoService.uploadArquivo(form.file);
        return Response.ok(ApiResponse.ok(new UploadResponse(res.url(), res.tamanhoBytes()), "Arquivo enviado")).build();
    }

    @Schema(description = "Arquivo enviado")
    public record UploadResponse(
            @Schema(description = "URL para usar em arquivoUrl") String url,
            @Schema(description = "Tamanho em bytes") long tamanhoBytes
    ) {}
}
