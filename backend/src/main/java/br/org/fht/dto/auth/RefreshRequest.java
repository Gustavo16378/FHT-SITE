package br.org.fht.dto.auth;

import jakarta.validation.constraints.NotBlank;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Requisição de renovação de token")
public record RefreshRequest(
        @NotBlank
        @Schema(description = "Refresh token obtido no login")
        String refreshToken
) {}
