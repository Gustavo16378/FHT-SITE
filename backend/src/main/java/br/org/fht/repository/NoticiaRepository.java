package br.org.fht.repository;

import br.org.fht.model.Noticia;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class NoticiaRepository implements PanacheRepositoryBase<Noticia, UUID> {

    private static final String ORDEM = " ORDER BY dataPublicacao DESC, createdAt DESC";

    public List<Noticia> listPublicadas() {
        return list("status = ?1" + ORDEM, "PUBLICADO");
    }

    public List<Noticia> listPublicadasPorCategoria(String categoria) {
        return list("status = ?1 AND categoria = ?2" + ORDEM, "PUBLICADO", categoria);
    }

    public List<Noticia> listTodas() {
        return list("FROM Noticia" + ORDEM);
    }

    public Optional<Noticia> findBySlug(String slug) {
        return find("slug", slug).firstResultOptional();
    }
}
