package br.org.fht.dto.clube;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Atleta na vitrine pública — só dados que podem aparecer publicamente
 * (nome, posição, categoria). Nada de CPF, RG, documentos ou contato (LGPD).
 */
@Schema(description = "Atleta exibido no modal público do clube")
public record AtletaVitrineDTO(
        @Schema(description = "Nome completo") String nome,
        @Schema(description = "Posição") String posicao,
        @Schema(description = "Categoria") String categoria
) {}
