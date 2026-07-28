package br.org.fht.dto.galeria;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Foto da galeria pública")
public record FotoDTO(
        @Schema(description = "UUID da foto") UUID id,
        @Schema(description = "URL da imagem") String imagemUrl,
        @Schema(description = "Evento / legenda") String evento,
        @Schema(description = "Ano", example = "2024") String ano,
        @Schema(description = "Categoria") String categoria,
        @Schema(description = "Tamanho no mosaico", enumeration = {"large", "medium", "small"}) String tamanho,
        @Schema(description = "Data/hora de criação") LocalDateTime createdAt
) {}
