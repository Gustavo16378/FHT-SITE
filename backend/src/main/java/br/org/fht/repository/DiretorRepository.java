package br.org.fht.repository;

import br.org.fht.model.Diretor;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class DiretorRepository implements PanacheRepositoryBase<Diretor, UUID> {

    /** Ordena pelos cards: campo ordem (presidente primeiro) e, empatando, pela data. */
    public List<Diretor> listOrdenados() {
        return list("ORDER BY ordem ASC, createdAt ASC");
    }
}
