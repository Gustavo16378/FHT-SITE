package br.org.fht.service;

import br.org.fht.common.Fuso;
import br.org.fht.repository.AtletaRepository;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

/**
 * Descarte de cadastro de atleta abandonado — o que nunca virou filiação.
 *
 * ⚠️ A REGRA MUDOU (ago/2026). Antes o pagamento era por atleta no ato do cadastro, e este job
 * apagava quem ficasse 24h sem comprovante. Agora o clube cadastra vários e paga tudo junto num
 * lote, quando puder: com a regra antiga o job apagaria justamente quem está esperando o lote
 * fechar — e levaria os consentimentos LGPD junto, por cascata.
 *
 * O prazo passou a ser longo (90 dias por padrão) e conta do cadastro, não de um prazo de pagamento.
 * O job continua existindo porque é a única rotina de descarte automático de dado pessoal do
 * sistema: cadastro de menor abandonado não pode ficar guardado para sempre (LGPD art. 6, III —
 * necessidade). Ver docs/MODULO-ATLETA-FLUXO.md.
 */
@ApplicationScoped
public class AtletaExpurgoJob {

    private static final Logger LOG = Logger.getLogger(AtletaExpurgoJob.class);

    @Inject AtletaRepository atletaRepository;

    /** Dias de tolerância antes de descartar um cadastro que nunca foi pago. */
    @ConfigProperty(name = "atleta.expurgo.dias", defaultValue = "90")
    long diasParaExpurgo;

    /** Uma vez por dia: o prazo agora é de meses, não faz sentido varrer de hora em hora. */
    @Scheduled(every = "24h", delayed = "10m", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    @Transactional
    public void expurgarCadastrosAbandonados() {
        var limite = Fuso.hoje().minusDays(diasParaExpurgo).atStartOfDay();
        var abandonados = atletaRepository.findAguardandoPagamentoAntesDe(limite);
        if (abandonados.isEmpty()) return;

        abandonados.forEach(a -> LOG.infof(
                "Expurgo: atleta %s (%s) cadastrado em %s nunca foi pago em %d dias — apagado",
                a.getId(), a.getNomeCompleto(), a.getCreatedAt(), diasParaExpurgo));

        // Os consentimentos vão junto (FK ON DELETE CASCADE na migration V12).
        abandonados.forEach(atletaRepository::delete);
        LOG.infof("Expurgo concluído: %d cadastro(s) abandonado(s) removido(s)", abandonados.size());
    }
}
