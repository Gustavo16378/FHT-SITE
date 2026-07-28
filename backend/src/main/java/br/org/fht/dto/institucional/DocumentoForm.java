package br.org.fht.dto.institucional;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Dados para publicar/editar um documento institucional")
public record DocumentoForm(
        @Schema(description = "Título", required = true) String titulo,
        @Schema(description = "Categoria", enumeration = {"Estatuto", "Regulamento", "Calendário", "Edital", "Circular"}, required = true) String categoria,
        @Schema(description = "URL do arquivo PDF (do upload)", required = true) String arquivoUrl,
        @Schema(description = "Data de publicação (ISO). Se ausente, usa hoje.", example = "2026-07-28") LocalDate dataPublicacao,
        @Schema(description = "Tamanho do arquivo em bytes") Long tamanhoBytes
) {}
