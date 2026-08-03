package br.org.fht.repository;

import br.org.fht.model.ClubePessoa;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ClubePessoaRepository implements PanacheRepositoryBase<ClubePessoa, UUID> {

    /** Principal primeiro, depois por função e nome. */
    public List<ClubePessoa> findByClubeId(UUID clubeId) {
        return list("clubeId = ?1 ORDER BY principal DESC, funcao, nome", clubeId);
    }

    public Optional<ClubePessoa> findByClubeIdAndId(UUID clubeId, UUID id) {
        return find("clubeId = ?1 AND id = ?2", clubeId, id).firstResultOptional();
    }

    public Optional<ClubePessoa> findPrincipal(UUID clubeId) {
        return find("clubeId = ?1 AND principal = true", clubeId).firstResultOptional();
    }
}
