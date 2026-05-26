package br.org.fht.repository;

import br.org.fht.model.Clube;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ClubeRepository implements PanacheRepositoryBase<Clube, UUID> {

    public List<Clube> findByStatus(String status) {
        return list("status", status);
    }

    public List<Clube> listAllOrdered() {
        return list("ORDER BY createdAt DESC");
    }
}
