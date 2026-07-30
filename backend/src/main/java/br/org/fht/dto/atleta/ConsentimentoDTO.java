package br.org.fht.dto.atleta;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Consentimento LGPD registrado para uma finalidade específica")
public record ConsentimentoDTO(
        @Schema(description = "UUID do consentimento") UUID id,
        @Schema(description = "Finalidade", enumeration = {"CADASTRO_ATLETA_MENOR", "IMAGEM_PUBLICA"}) String finalidade,
        @Schema(description = "O titular era menor de idade quando consentiu") boolean titularMenor,
        @Schema(description = "Nome de quem consentiu (responsável legal, se menor)") String consentidoPorNome,
        @Schema(description = "CPF de quem consentiu") String consentidoPorCpf,
        @Schema(description = "Versão do texto do termo aceito", example = "1.0") String textoVersao,
        @Schema(description = "Data/hora do aceite") LocalDateTime concedidoEm,
        @Schema(description = "Data/hora da revogação (nulo se ativo)") LocalDateTime revogadoEm
) {}
