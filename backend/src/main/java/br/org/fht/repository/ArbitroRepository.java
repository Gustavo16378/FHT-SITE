package br.org.fht.repository;

import br.org.fht.model.Arbitro;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ArbitroRepository implements PanacheRepositoryBase<Arbitro, UUID> {

    public List<Arbitro> listAllOrdered() {
        return list("ORDER BY createdAt DESC");
    }

    /** Árbitros credenciados, para a vitrine pública. */
    public List<Arbitro> listCredenciados() {
        return list("status = ?1 ORDER BY nome ASC", "CREDENCIADO");
    }
}
