package br.org.fht.repository;

import br.org.fht.model.Consentimento;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ConsentimentoRepository implements PanacheRepositoryBase<Consentimento, UUID> {

    public List<Consentimento> findByAtletaId(UUID atletaId) {
        return list("atletaId = ?1 ORDER BY concedidoEm DESC", atletaId);
    }

    /** Carrega os consentimentos de vários atletas de uma vez — evita N+1 na listagem. */
    public List<Consentimento> findByAtletaIds(Collection<UUID> atletaIds) {
        if (atletaIds.isEmpty()) return List.of();
        return list("atletaId IN ?1 ORDER BY concedidoEm DESC", atletaIds);
    }
}
