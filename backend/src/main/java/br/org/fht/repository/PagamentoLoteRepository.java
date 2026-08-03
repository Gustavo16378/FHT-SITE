package br.org.fht.repository;

import br.org.fht.model.PagamentoLote;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PagamentoLoteRepository implements PanacheRepositoryBase<PagamentoLote, UUID> {

    public List<PagamentoLote> findByClubeId(UUID clubeId) {
        return list("clubeId = ?1 ORDER BY enviadoEm DESC", clubeId);
    }

    /** Fila de trabalho da federação: o que está esperando conferência primeiro. */
    public List<PagamentoLote> listAllOrdered() {
        return list("ORDER BY CASE WHEN status = 'AGUARDANDO_BAIXA' THEN 0 ELSE 1 END, enviadoEm DESC");
    }

    public Optional<PagamentoLote> findByClubeIdAndId(UUID clubeId, UUID id) {
        return find("clubeId = ?1 AND id = ?2", clubeId, id).firstResultOptional();
    }

    public long contarAguardandoBaixa() {
        return count("status", PagamentoLote.STATUS_AGUARDANDO_BAIXA);
    }
}
