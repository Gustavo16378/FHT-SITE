package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.noticia.ImagemForm;
import br.org.fht.dto.noticia.NoticiaForm;
import br.org.fht.service.NoticiaService;
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

@Path("/api/noticias")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Notícias", description = "Blog institucional da FHT — público (leitura) e admin (CRUD)")
public class NoticiaResource {

    @Inject NoticiaService noticiaService;
    @Inject JsonWebToken jwt;

    // ------------------------- Público -------------------------

    @GET
    @Operation(summary = "Listar notícias publicadas",
            description = "Endpoint público. Só notícias PUBLICADAS, mais recentes primeiro. Filtro opcional por categoria.")
    @APIResponse(responseCode = "200", description = "Lista de notícias publicadas")
    public Response listarPublicas(
            @Parameter(description = "Filtrar por categoria") @QueryParam("categoria") String categoria) {
        return Response.ok(ApiResponse.ok(noticiaService.listarPublicas(categoria), "OK")).build();
    }

    @GET
    @Path("/gerenciar")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Listar todas as notícias (admin)",
            description = "Inclui rascunhos e o corpo completo, para a gestão no painel.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Lista completa de notícias"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response listarTodas() {
        return Response.ok(ApiResponse.ok(noticiaService.listarTodas(), "OK")).build();
    }

    @GET
    @Path("/{slug}")
    @Operation(summary = "Buscar notícia publicada pelo slug",
            description = "Endpoint público. Retorna a notícia completa se estiver PUBLICADA.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Notícia encontrada"),
            @APIResponse(responseCode = "404", description = "Notícia não encontrada ou não publicada")
    })
    public Response buscarPorSlug(
            @Parameter(description = "Slug da notícia", required = true) @PathParam("slug") String slug) {
        return Response.ok(ApiResponse.ok(noticiaService.buscarPorSlug(slug), "OK")).build();
    }

    // ------------------------- Admin -------------------------

    @POST
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Criar notícia")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Notícia criada"),
            @APIResponse(responseCode = "400", description = "Dados inválidos"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response criar(NoticiaForm form) {
        var noticia = noticiaService.criar(form, jwt);
        return Response.status(201).entity(ApiResponse.created(noticia, "Notícia criada")).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Editar notícia")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Notícia atualizada"),
            @APIResponse(responseCode = "400", description = "Dados inválidos"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Notícia não encontrada")
    })
    public Response atualizar(
            @Parameter(description = "UUID da notícia", required = true) @PathParam("id") UUID id,
            NoticiaForm form) {
        return Response.ok(ApiResponse.ok(noticiaService.atualizar(id, form), "Notícia atualizada")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Deletar notícia")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Notícia deletada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Notícia não encontrada")
    })
    public Response deletar(
            @Parameter(description = "UUID da notícia", required = true) @PathParam("id") UUID id) {
        noticiaService.deletar(id);
        return Response.ok(ApiResponse.ok(null, "Notícia deletada")).build();
    }

    @POST
    @Path("/upload-imagem")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Subir imagem (capa ou corpo)",
            description = "Faz upload da imagem e devolve a URL para salvar na notícia. Usa o storage local em dev (sem R2).")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Imagem enviada — retorna a URL"),
            @APIResponse(responseCode = "400", description = "Arquivo ausente ou inválido"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response uploadImagem(@BeanParam ImagemForm form) {
        String url = noticiaService.uploadImagem(form.file);
        return Response.ok(ApiResponse.ok(new UploadResponse(url), "Imagem enviada")).build();
    }

    @Schema(description = "URL do arquivo enviado")
    public record UploadResponse(
            @Schema(description = "URL para usar em imagemCapaUrl ou no corpo") String url
    ) {}
}
