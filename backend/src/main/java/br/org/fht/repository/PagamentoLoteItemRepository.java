package br.org.fht.repository;

import br.org.fht.model.PagamentoLoteItem;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PagamentoLoteItemRepository implements PanacheRepositoryBase<PagamentoLoteItem, UUID> {

    public List<PagamentoLoteItem> findByLoteId(UUID loteId) {
        return list("loteId = ?1 ORDER BY atletaNome", loteId);
    }

    /** Carrega os itens de vários lotes de uma vez — evita N+1 na listagem. */
    public List<PagamentoLoteItem> findByLoteIds(Collection<UUID> loteIds) {
        if (loteIds.isEmpty()) return List.of();
        return list("loteId IN ?1 ORDER BY atletaNome", loteIds);
    }

    /**
     * Atletas que já estão num lote vivo do ano — não podem ser cobrados de novo.
     * É a leitura da mesma regra que o índice único garante no banco.
     */
    public List<PagamentoLoteItem> findAtivosPorAno(Collection<UUID> atletaIds, int ano) {
        if (atletaIds.isEmpty()) return List.of();
        return list("atletaId IN ?1 AND ano = ?2 AND ativo = true", atletaIds, ano);
    }

    /** O atleta tem anuidade CONFIRMADA no ano? É o portão financeiro da aprovação. */
    public boolean temPagamentoConfirmado(UUID atletaId, int ano) {
        return count("atletaId = ?1 AND ano = ?2 AND ativo = true"
                + " AND loteId IN (SELECT l.id FROM PagamentoLote l WHERE l.status = 'CONFIRMADO')",
                atletaId, ano) > 0;
    }
}
