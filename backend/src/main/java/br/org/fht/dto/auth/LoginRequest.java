package br.org.fht.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Credenciais de acesso")
public record LoginRequest(
        @NotBlank @Email
        @Schema(description = "E-mail cadastrado", example = "admin@fht.org.br")
        String email,

        @NotBlank
        @Schema(description = "Senha do usuário", example = "123456")
        String senha
) {}
