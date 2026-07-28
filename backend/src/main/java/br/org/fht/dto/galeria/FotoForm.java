package br.org.fht.dto.galeria;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Payload JSON para criar/editar uma foto da galeria. A imagem em si é enviada
 * antes, via POST /api/galeria/upload-imagem, que devolve a `imagemUrl`.
 */
@Schema(description = "Dados de uma foto da galeria")
public record FotoForm(
        @Schema(description = "URL da imagem (do upload)", required = true) String imagemUrl,
        @Schema(description = "Evento / legenda", required = true) String evento,
        @Schema(description = "Ano", example = "2024") String ano,
        @Schema(description = "Categoria", example = "Adulto Masculino") String categoria,
        @Schema(description = "Tamanho no mosaico", enumeration = {"large", "medium", "small"}) String tamanho
) {}
