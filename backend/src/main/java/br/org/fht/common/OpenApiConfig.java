package br.org.fht.common;

import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeIn;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.info.Contact;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;
import org.eclipse.microprofile.openapi.annotations.servers.Server;

@OpenAPIDefinition(
        info = @Info(
                title = "FHT API",
                version = "1.0.0",
                description = """
                        API da **Federação de Handebol do Tocantins** — gerenciamento de clubes, \
                        atletas e afiliações.

                        ## Autenticação
                        Endpoints protegidos exigem um Bearer Token JWT obtido via `POST /api/auth/login`.
                        Clique em **Authorize** e cole o token no formato: `Bearer <token>`

                        ## Roles
                        | Role | Descrição |
                        |---|---|
                        | `ADMIN_FHT` | Administrador da federação — acesso total |
                        | `ADMIN_CLUBE` | Representante de clube afiliado |
                        """,
                contact = @Contact(name = "FHT — Federação de Handebol do Tocantins",
                        url = "https://fht.org.br")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Desenvolvimento local"),
                @Server(url = "https://api.fht.org.br", description = "Produção")
        }
)
@SecurityScheme(
        securitySchemeName = "BearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER,
        description = "Token JWT obtido via POST /api/auth/login"
)
public class OpenApiConfig extends Application {
}
