package br.org.fht.dto.competicao;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.List;

/**
 * Criacao e edicao de competicao (JSON). Nao recebe status: ele e derivado das datas.
 * Para mudar o status usa-se os PATCHs de ciclo de vida do resource.
 */
@Schema(description = "Dados de uma competicao. Campos nulos sao ignorados na edicao (PUT parcial).")
public record CompeticaoForm(
        @Schema(description = "Nome da competicao", example = "Campeonato Tocantinense Adulto 2026", required = true)
        String nome,
        @Schema(description = "Descricao livre") String descricao,
        @Schema(description = "Categorias atendidas", example = "[\"adulto\",\"masculino\"]")
        List<String> categorias,
        @Schema(description = "Data de inicio (AAAA-MM-DD)", example = "2026-04-10", required = true)
        String dataInicio,
        @Schema(description = "Data de fim (AAAA-MM-DD)", example = "2026-06-28", required = true)
        String dataFim,
        @Schema(description = "Local / ginasio", example = "Ginasio Ayrton Senna") String local,
        @Schema(description = "Cidade", example = "Palmas") String cidade,
        @Schema(description = "UF", example = "TO") String uf,
        @Schema(description = "Temporada. Se omitida, usa o ano da data de inicio", example = "2026") Integer temporada,
        @Schema(description = "Numero de equipes (informado a mao ate existirem inscricoes)") Integer numeroEquipes,
        @Schema(description = "Link externo de inscricao (opcional)") String linkInscricao,
        @Schema(description = "Cor do card no site", example = "#1A3A8F") String cor
) {}
