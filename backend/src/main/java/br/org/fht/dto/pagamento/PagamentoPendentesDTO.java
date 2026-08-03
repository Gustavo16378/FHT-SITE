package br.org.fht.dto.pagamento;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Alimenta o botão de pagamento do painel do clube: quem está devendo e quanto dá. */
@Schema(description = "Atletas com anuidade pendente e o total a pagar")
public record PagamentoPendentesDTO(
        @Schema(description = "Ano de referência da anuidade") int ano,
        @Schema(description = "Valor unitário da anuidade", example = "35.00") BigDecimal valorUnitario,
        @Schema(description = "Total se pagar todos", example = "245.00") BigDecimal valorTotal,
        @Schema(description = "Atletas aguardando pagamento") List<AtletaPendenteDTO> atletas
) {
    @Schema(description = "Atleta com anuidade em aberto")
    public record AtletaPendenteDTO(
            UUID id,
            String nome,
            String categoria,
            @Schema(description = "Valor da anuidade deste atleta") BigDecimal valor
    ) {}
}
