package br.org.fht.dto.noticia;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;

/**
 * Payload JSON para criar ou editar uma notícia. Na edição, o slug é recalculado
 * apenas se o título mudar (para não quebrar links já publicados). Campos de imagem
 * recebem a URL já retornada pelo endpoint de upload (POST /api/noticias/upload-imagem).
 */
@Schema(description = "Dados para criar ou editar uma notícia")
public record NoticiaForm(
        @Schema(description = "Título", required = true) String titulo,
        @Schema(description = "Categoria", enumeration = {"Institucional", "Competição", "Arbitragem", "Seleção"}, required = true) String categoria,
        @Schema(description = "Resumo curto para o card") String resumo,
        @Schema(description = "Corpo completo (HTML/rich text)") String conteudo,
        @Schema(description = "URL da imagem de capa") String imagemCapaUrl,
        @Schema(description = "Data de publicação (ISO). Se ausente, usa a data atual.", example = "2026-07-28") LocalDate dataPublicacao,
        @Schema(description = "Marcar como destaque na home") Boolean destaque,
        @Schema(description = "Status", enumeration = {"RASCUNHO", "PUBLICADO"}) String status
) {}
