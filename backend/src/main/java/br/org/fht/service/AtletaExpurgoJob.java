package br.org.fht.service;

import br.org.fht.repository.AtletaRepository;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;

/**
 * Apaga cadastros de atleta que venceram o prazo sem o comprovante de pagamento.
 * "Não faz sentido cadastrar e não pagar" — ver docs/MODULO-ATLETA-FLUXO.md §3.
 *
 * Também é higiene de LGPD: dado pessoal (inclusive de menor) que não virou filiação
 * não tem por que ficar guardado — princípio da necessidade (art. 6, III).
 */
@ApplicationScoped
public class AtletaExpurgoJob {

    private static final Logger LOG = Logger.getLogger(AtletaExpurgoJob.class);

    @Inject AtletaRepository atletaRepository;

    /** De hora em hora — o prazo é contado em horas, não precisa de granularidade menor. */
    @Scheduled(every = "1h", delayed = "5m", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    @Transactional
    public void expurgarCadastrosNaoPagos() {
        var expirados = atletaRepository.findPagamentoExpirado(LocalDateTime.now());
        if (expirados.isEmpty()) return;

        expirados.forEach(a -> LOG.infof("Expurgo: atleta %s (%s) sem comprovante até %s — apagado",
                a.getId(), a.getNomeCompleto(), a.getPrazoPagamentoAte()));

        // Os consentimentos vão junto (FK ON DELETE CASCADE na migration V12).
        expirados.forEach(atletaRepository::delete);
        LOG.infof("Expurgo concluído: %d cadastro(s) sem pagamento removido(s)", expirados.size());
    }
}
