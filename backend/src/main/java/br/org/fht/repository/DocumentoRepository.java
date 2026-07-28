package br.org.fht.repository;

import br.org.fht.model.DocumentoInstitucional;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class DocumentoRepository implements PanacheRepositoryBase<DocumentoInstitucional, UUID> {

    private static final String ORDEM = " ORDER BY dataPublicacao DESC, createdAt DESC";

    public List<DocumentoInstitucional> listOrdenados() {
        return list("FROM DocumentoInstitucional" + ORDEM);
    }

    public List<DocumentoInstitucional> listPorCategoria(String categoria) {
        return list("categoria = ?1" + ORDEM, categoria);
    }
}
