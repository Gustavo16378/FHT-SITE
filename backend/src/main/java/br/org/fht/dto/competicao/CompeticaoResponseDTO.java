package br.org.fht.dto.competicao;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(description = "Competicao — visao administrativa")
public record CompeticaoResponseDTO(
        @Schema(description = "UUID da competicao") UUID id,
        @Schema(description = "Nome") String nome,
        @Schema(description = "Descricao") String descricao,
        @Schema(description = "Categorias atendidas") List<String> categorias,
        @Schema(description = "Data de inicio") LocalDate dataInicio,
        @Schema(description = "Data de fim") LocalDate dataFim,
        @Schema(description = "Local / ginasio") String local,
        @Schema(description = "Cidade") String cidade,
        @Schema(description = "UF") String uf,
        @Schema(description = "Temporada") Integer temporada,
        @Schema(description = "Numero de equipes") Integer numeroEquipes,
        @Schema(description = "Link externo de inscricao") String linkInscricao,
        @Schema(description = "Cor do card") String cor,
        @Schema(description = "URL do regulamento") String regulamentoUrl,
        @Schema(description = "Status efetivo (override, se houver; senao derivado das datas)",
                enumeration = {"EM_BREVE", "INSCRICOES_ABERTAS", "EM_ANDAMENTO", "ENCERRADO", "ADIADO", "CANCELADO"})
        String status,
        @Schema(description = "Override manual em vigor — nulo significa status automatico pelas datas")
        String statusOverride,
        @Schema(description = "Aparece na home") boolean visivelNaHome,
        @Schema(description = "Data/hora do cadastro") LocalDateTime createdAt
) {}
