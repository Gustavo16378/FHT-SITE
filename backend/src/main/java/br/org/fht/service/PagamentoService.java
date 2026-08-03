package br.org.fht.service;

import br.org.fht.dto.pagamento.PagamentoLoteDTO;
import br.org.fht.dto.pagamento.PagamentoLoteForm;
import br.org.fht.dto.pagamento.PagamentoPendentesDTO;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

public interface PagamentoService {

    /** Atletas do clube com anuidade em aberto + o total — alimenta o botão de pagamento. */
    PagamentoPendentesDTO listarPendentes(JsonWebToken jwt);

    /** O clube envia o pagamento: N atletas, 1 comprovante. */
    PagamentoLoteDTO enviarPagamento(PagamentoLoteForm form, JsonWebToken jwt);

    /** Lotes do clube logado (histórico de pagamentos). */
    List<PagamentoLoteDTO> listarDoClube(JsonWebToken jwt);

    /** Fila de conferência da federação. */
    List<PagamentoLoteDTO> listarTodos();

    PagamentoLoteDTO buscarPorId(UUID id, JsonWebToken jwt);

    /**
     * Federação confere e dá baixa. Ativa os atletas do lote que também passam no portão
     * documental; devolve o lote com o que foi ativado e o que ficou bloqueado.
     */
    BaixaResultado darBaixa(UUID id, JsonWebToken jwt);

    /** Recusa o pagamento e devolve os atletas para a fila de pendentes. */
    PagamentoLoteDTO rejeitar(UUID id, String motivo, JsonWebToken jwt);

    /** Resultado da baixa: quem foi ativado e quem continua barrado, com o motivo. */
    record BaixaResultado(
            PagamentoLoteDTO lote,
            List<String> ativados,
            List<Bloqueio> bloqueados
    ) {
        public record Bloqueio(String atletaNome, String motivo) {}
    }
}
