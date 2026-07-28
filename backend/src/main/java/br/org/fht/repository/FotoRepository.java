package br.org.fht.repository;

import br.org.fht.model.Foto;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class FotoRepository implements PanacheRepositoryBase<Foto, UUID> {

    /** Ordena por ano (mais recente primeiro) e, dentro do ano, pela mais nova. */
    public List<Foto> listOrdenadas() {
        return list("ORDER BY ano DESC, createdAt DESC");
    }
}
