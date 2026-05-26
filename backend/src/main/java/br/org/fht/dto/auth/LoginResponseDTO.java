package br.org.fht.dto.auth;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Resposta do login com tokens JWT")
public record LoginResponseDTO(
        @Schema(description = "Access token JWT (validade: 1 dia)") String token,
        @Schema(description = "Refresh token JWT (validade: 30 dias)") String refreshToken,
        @Schema(description = "Role do usuário autenticado", enumeration = {"ADMIN_FHT", "ADMIN_CLUBE"}) String role
) {}
