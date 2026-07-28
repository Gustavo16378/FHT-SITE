package br.org.fht.dto.institucional;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Documento institucional público (transparência)")
public record DocumentoDTO(
        @Schema(description = "UUID do documento") UUID id,
        @Schema(description = "Título") String titulo,
        @Schema(description = "Categoria", enumeration = {"Estatuto", "Regulamento", "Calendário", "Edital", "Circular"}) String categoria,
        @Schema(description = "URL do arquivo (PDF)") String arquivoUrl,
        @Schema(description = "Data de publicação") LocalDate dataPublicacao,
        @Schema(description = "Publicado por (admin/diretor)") String publicadoPor,
        @Schema(description = "Tamanho do arquivo em bytes") Long tamanhoBytes,
        @Schema(description = "Data/hora de criação") LocalDateTime createdAt
) {}
