package br.org.fht.dto.pagamento;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(description = "Lote de pagamento da anuidade enviado pelo clube")
public record PagamentoLoteDTO(
        UUID id,
        UUID clubeId,
        @Schema(description = "Nome do clube — para a fila do admin") String clubeNome,
        @Schema(description = "Código curto do lote", example = "FHT-2026-A3F91C") String protocolo,
        int ano,
        BigDecimal valorTotal,
        int quantidadeAtletas,
        @Schema(description = "URL do comprovante enviado pelo clube") String comprovanteUrl,
        @Schema(enumeration = {"AGUARDANDO_BAIXA", "CONFIRMADO", "REJEITADO"}) String status,
        String observacao,
        String motivoRejeicao,
        LocalDateTime enviadoEm,
        LocalDateTime baixadoEm,
        String baixadoPor,
        @Schema(description = "Atletas cobertos por este pagamento — é o que a federação confere para dar baixa")
        List<ItemDTO> itens
) {
    @Schema(description = "Atleta coberto pelo lote")
    public record ItemDTO(
            @Schema(description = "Nulo se o atleta foi removido depois") UUID atletaId,
            String atletaNome,
            BigDecimal valor
    ) {}
}
