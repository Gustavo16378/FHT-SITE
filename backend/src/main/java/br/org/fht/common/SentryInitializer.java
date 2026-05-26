package br.org.fht.common;

import io.quarkus.runtime.Startup;
import io.sentry.Sentry;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Optional;

@Startup
@ApplicationScoped
public class SentryInitializer {

    private static final Logger LOG = Logger.getLogger(SentryInitializer.class);

    @ConfigProperty(name = "sentry.dsn")
    Optional<String> dsn;

    @ConfigProperty(name = "sentry.environment")
    Optional<String> environment;

    void init(@jakarta.enterprise.event.Observes io.quarkus.runtime.StartupEvent ev) {
        dsn.filter(d -> !d.isBlank()).ifPresent(d -> {
            Sentry.init(options -> {
                options.setDsn(d);
                options.setEnvironment(environment.orElse("production"));
                options.setTracesSampleRate(0.2);
            });
            LOG.info("Sentry inicializado");
        });
    }
}
