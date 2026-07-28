package br.org.fht.dto.noticia;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Notícia completa, incluindo o corpo (para o post individual e o editor do admin)")
public record NoticiaResponseDTO(
        @Schema(description = "UUID único da notícia") UUID id,
        @Schema(description = "Título") String titulo,
        @Schema(description = "Slug para a URL", example = "fht-lanca-calendario-2025") String slug,
        @Schema(description = "Categoria", enumeration = {"Institucional", "Competição", "Arbitragem", "Seleção"}) String categoria,
        @Schema(description = "Resumo curto para o card") String resumo,
        @Schema(description = "Corpo completo (HTML/rich text)") String conteudo,
        @Schema(description = "URL da imagem de capa") String imagemCapaUrl,
        @Schema(description = "Nome do autor (admin que publicou)") String autorNome,
        @Schema(description = "Data de publicação") LocalDate dataPublicacao,
        @Schema(description = "Notícia em destaque na home") boolean destaque,
        @Schema(description = "Status", enumeration = {"RASCUNHO", "PUBLICADO"}) String status,
        @Schema(description = "Data/hora de criação") LocalDateTime createdAt,
        @Schema(description = "Data/hora da última atualização") LocalDateTime updatedAt
) {}
