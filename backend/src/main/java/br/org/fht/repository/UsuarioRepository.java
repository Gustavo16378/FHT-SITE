package br.org.fht.repository;

import br.org.fht.model.Usuario;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UsuarioRepository implements PanacheRepositoryBase<Usuario, UUID> {

    /** Normaliza igual ao {@code Usuario.setEmail} — senão a busca não acha o que a gravação guardou. */
    public Optional<Usuario> findByEmail(String email) {
        return find("email", normalizar(email)).firstResultOptional();
    }

    public boolean existsByEmail(String email) {
        return count("email", normalizar(email)) > 0;
    }

    /** Conta de acesso do clube, pelo vínculo — não pelo e-mail, que o clube pode editar. */
    public Optional<Usuario> findByClubeId(UUID clubeId) {
        return find("clubeId", clubeId).firstResultOptional();
    }

    private static String normalizar(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
