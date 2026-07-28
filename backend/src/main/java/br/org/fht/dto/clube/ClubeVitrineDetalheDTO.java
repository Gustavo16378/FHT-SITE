package br.org.fht.dto.clube;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

/**
 * Detalhe público do clube para o modal da home: dados públicos + elenco (atletas ativos).
 * O histórico de competições participadas entra depois, com o módulo de Competições.
 */
@Schema(description = "Detalhe público do clube (modal da home)")
public record ClubeVitrineDetalheDTO(
        @Schema(description = "UUID do clube") UUID id,
        @Schema(description = "Nome") String nome,
        @Schema(description = "Cidade sede") String cidade,
        @Schema(description = "UF") String uf,
        @Schema(description = "Sigla") String sigla,
        @Schema(description = "Categorias (derivadas dos atletas ativos)") List<String> categorias,
        @Schema(description = "Total de atletas ativos") int totalAtletas,
        @Schema(description = "Elenco público (atletas ativos)") List<AtletaVitrineDTO> atletas
) {}
