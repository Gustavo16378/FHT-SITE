package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.storage.R2StorageService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.Map;
import java.util.UUID;

@Path("/api/upload")
@Produces(MediaType.APPLICATION_JSON)
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Upload", description = "Upload de arquivos para o Cloudflare R2")
public class UploadResource {

    @Inject R2StorageService r2;

    @POST
    @Path("/arquivo")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @RolesAllowed({"ADMIN_CLUBE", "ADMIN_FHT"})
    @Operation(summary = "Fazer upload de arquivo",
            description = "Envia um arquivo para o Cloudflare R2 e retorna a URL pública. Campos: `file` (obrigatório) e `pasta` (opcional).")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Upload realizado — retorna `url` pública"),
            @APIResponse(responseCode = "400", description = "Nenhum arquivo enviado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "503", description = "R2 não configurado no ambiente")
    })
    public Response uploadArquivo(
            @Parameter(description = "Arquivo (multipart field: file)")
            @RestForm("file") FileUpload file,
            @Parameter(description = "Subdiretório no bucket", example = "fotos")
            @RestForm String pasta) {
        if (file == null || file.size() == 0) {
            throw new WebApplicationException("Nenhum arquivo enviado", 400);
        }

        String dir = pasta != null ? pasta.replaceAll("[^a-zA-Z0-9_-]", "") : "misc";
        String key = dir + "/" + UUID.randomUUID() + "_" + file.fileName();
        String url = r2.upload(key, file);

        return Response.ok(ApiResponse.ok(Map.of("url", url), "Upload realizado com sucesso")).build();
    }
}
