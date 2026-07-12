package br.org.fht.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.io.IOException;
import java.nio.file.Files;

/**
 * Serve os arquivos salvos localmente pelo R2StorageService quando o R2 não está
 * configurado (dev/demo). Público e sem auth de propósito: o browser precisa carregar
 * as imagens/PDFs via <img>/<a> (que não mandam Bearer). Em produção o storage é o R2
 * (bucket privado + URLs assinadas — ver docs/LGPD-CONFORMIDADE.md §5.6), e este endpoint
 * deixa de ser usado.
 */
@Path("/api/files")
@Tag(name = "Arquivos", description = "Servidor local de uploads (fallback dev, sem R2)")
public class FileResource {

    @ConfigProperty(name = "storage.local-dir", defaultValue = "/app/uploads")
    String localDir;

    @GET
    @Path("/{path:.+}")
    @Produces(MediaType.WILDCARD)
    public Response get(@PathParam("path") String path) {
        java.nio.file.Path base = java.nio.file.Path.of(localDir).toAbsolutePath().normalize();
        java.nio.file.Path file = base.resolve(path).normalize();

        // Proteção contra path traversal (../): o arquivo tem que estar dentro de localDir.
        if (!file.startsWith(base)) {
            throw new WebApplicationException("Caminho inválido", 400);
        }
        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            throw new WebApplicationException("Arquivo não encontrado", 404);
        }

        try {
            String contentType = Files.probeContentType(file);
            byte[] bytes = Files.readAllBytes(file);
            return Response.ok(bytes)
                    .type(contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM)
                    .build();
        } catch (IOException e) {
            throw new WebApplicationException("Falha ao ler arquivo", 500);
        }
    }
}
