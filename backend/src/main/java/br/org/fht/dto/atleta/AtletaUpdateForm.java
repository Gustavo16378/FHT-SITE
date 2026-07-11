package br.org.fht.dto.atleta;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Campos editáveis de um atleta (dados textuais).
 * Não altera documentos, status, CPF nem clube — só o cadastro básico.
 * Campos nulos são ignorados (atualização parcial).
 */
@Schema(description = "Campos editáveis do atleta (dados textuais). Campos nulos são ignorados.")
public record AtletaUpdateForm(
        String nomeCompleto,
        @Schema(description = "Data de nascimento (yyyy-MM-dd)", example = "2000-05-15") String dataNascimento,
        @Schema(description = "Sexo", enumeration = {"M", "F"}) String sexo,
        String rg,
        String telefone,
        String email,
        String cidade,
        String ufResidencia,
        String posicao,
        String categoria,
        Boolean transferencia,
        String clubeAnterior
) {}
