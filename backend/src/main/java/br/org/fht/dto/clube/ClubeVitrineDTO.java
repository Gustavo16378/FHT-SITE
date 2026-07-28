package br.org.fht.dto.clube;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

/**
 * Dados PÚBLICOS de um clube para a vitrine da home (card). Não expõe CNPJ,
 * documentos nem contato do representante — isso é só do painel admin.
 */
@Schema(description = "Clube na vitrine pública (card da home)")
public record ClubeVitrineDTO(
        @Schema(description = "UUID do clube") UUID id,
        @Schema(description = "Nome") String nome,
        @Schema(description = "Cidade sede") String cidade,
        @Schema(description = "UF") String uf,
        @Schema(description = "Sigla") String sigla,
        @Schema(description = "Categorias (derivadas dos atletas ativos)") List<String> categorias,
        @Schema(description = "Total de atletas ativos") int totalAtletas
) {}
