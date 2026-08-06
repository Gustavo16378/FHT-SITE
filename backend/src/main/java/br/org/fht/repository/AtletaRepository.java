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
     * Cadastros abandonados: entraram na fila de pagamento e nunca saíram dela.
     *
     * <p>O relógio é {@code aguardandoDesde}, não {@code createdAt}: um atleta devolvido à fila
     * pelo "reconsiderar" reinicia a contagem, senão a federação desfazia uma rejeição antiga e
     * o job apagava o cadastro na varredura seguinte.
     *
     * <p>E fica de fora quem já está num lote vivo — pagou e espera a federação dar baixa.
     * Sem esse recorte, o clube que pagou em março e não teve o comprovante conferido perdia o
     * atleta em junho, com o dinheiro já pago.
     *
     * <p>Alvo do {@link br.org.fht.service.AtletaExpurgoJob}.
     */
    public List<Atleta> findAbandonadosAntesDe(LocalDateTime limite) {
        return list("status = ?1 AND aguardandoDesde < ?2"
                + " AND id NOT IN (SELECT i.atletaId FROM PagamentoLoteItem i"
                + "                WHERE i.atletaId IS NOT NULL AND i.ativo = true)",
                "AGUARDANDO_PAGAMENTO", limite);
    }
}
