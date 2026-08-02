package br.org.fht.repository;

import br.org.fht.model.Atleta;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class AtletaRepository implements PanacheRepositoryBase<Atleta, UUID> {

    public List<Atleta> findByClubeId(UUID clubeId) {
        return list("clubeId = ?1 ORDER BY createdAt DESC", clubeId);
    }

    public List<Atleta> listAllOrdered() {
        return list("ORDER BY createdAt DESC");
    }

    public boolean existsByCpf(String cpf) {
        return count("cpf", cpf) > 0;
    }

    public Optional<Atleta> findByClubeIdAndId(UUID clubeId, UUID atletaId) {
        return find("clubeId = ?1 AND id = ?2", clubeId, atletaId).firstResultOptional();
    }

    /**
     * Cadastros abandonados: nunca foram pagos e já passaram do prazo de tolerância.
     * Conta do cadastro, não de um prazo por atleta — o pagamento agora é em lote, quando o
     * clube puder. Alvo do AtletaExpurgoJob.
     */
    public List<Atleta> findAguardandoPagamentoAntesDe(LocalDateTime limite) {
        return list("status = ?1 AND createdAt < ?2", "AGUARDANDO_PAGAMENTO", limite);
    }
}
