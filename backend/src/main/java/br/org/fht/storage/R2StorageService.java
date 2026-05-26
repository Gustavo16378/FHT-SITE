package br.org.fht.storage;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.multipart.FileUpload;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.util.Optional;

@ApplicationScoped
public class R2StorageService {

    private static final Logger LOG = Logger.getLogger(R2StorageService.class);

    @ConfigProperty(name = "r2.account-id")
    Optional<String> accountId;

    @ConfigProperty(name = "r2.access-key-id")
    Optional<String> accessKeyId;

    @ConfigProperty(name = "r2.secret-access-key")
    Optional<String> secretAccessKey;

    @ConfigProperty(name = "r2.bucket", defaultValue = "fht-documentos")
    String bucket;

    @ConfigProperty(name = "r2.public-url")
    Optional<String> publicUrl;

    private S3Client s3Client;

    @PostConstruct
    void init() {
        boolean configured = accountId.filter(s -> !s.isBlank()).isPresent()
                && accessKeyId.filter(s -> !s.isBlank()).isPresent()
                && secretAccessKey.filter(s -> !s.isBlank()).isPresent();

        if (!configured) {
            LOG.warn("R2 não configurado — uploads desabilitados (defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
            return;
        }

        s3Client = S3Client.builder()
                .endpointOverride(URI.create("https://" + accountId.get() + ".r2.cloudflarestorage.com"))
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId.get(), secretAccessKey.get())
                ))
                .httpClient(UrlConnectionHttpClient.create())
                .forcePathStyle(true)
                .build();

        LOG.info("R2StorageService inicializado (bucket: " + bucket + ")");
    }

    public String upload(String key, FileUpload fileUpload) {
        if (s3Client == null) {
            throw new WebApplicationException("Upload não disponível: R2 sem credenciais configuradas", 503);
        }

        try {
            byte[] bytes = Files.readAllBytes(fileUpload.uploadedFile());
            String contentType = fileUpload.contentType() != null
                    ? fileUpload.contentType()
                    : "application/octet-stream";

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .contentLength((long) bytes.length)
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(bytes));

            return publicUrl.orElse("") + "/" + key;
        } catch (IOException e) {
            throw new WebApplicationException("Falha ao fazer upload do arquivo: " + e.getMessage(), 500);
        }
    }
}
