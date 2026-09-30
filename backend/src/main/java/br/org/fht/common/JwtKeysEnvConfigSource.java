package br.org.fht.common;

import org.eclipse.microprofile.config.spi.ConfigSource;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Chaves JWT vindas do ambiente, em base64 (produção no Render e docker compose).
 *
 * <p>{@code JWT_PUBLIC_KEY} e {@code JWT_PRIVATE_KEY} carregam o arquivo .pem INTEIRO em base64,
 * numa linha só ({@code openssl base64 -A -in chave.pem}): o painel do Render estraga quebra de
 * linha, e os .pem não entram na imagem. Quando presentes, viram o conteúdo de
 * {@code mp.jwt.verify.publickey} / {@code smallrye.jwt.sign.key} e anulam as {@code *.location}
 * dos .pem locais. Sem as variáveis (dev), esta fonte fica vazia e nada muda.
 *
 * <p>Ordinal 275: acima do application.properties (250), abaixo das env vars (300).
 * Registrada em META-INF/services/org.eclipse.microprofile.config.spi.ConfigSource.
 */
public class JwtKeysEnvConfigSource implements ConfigSource {

    private final Map<String, String> props = new HashMap<>();

    public JwtKeysEnvConfigSource() {
        String publica = decodificar("JWT_PUBLIC_KEY");
        if (publica != null) {
            props.put("mp.jwt.verify.publickey", publica);
            props.put("mp.jwt.verify.publickey.location", "NONE"); // NONE = "não configurado" pro SmallRye JWT; vazio ele recusa
        }
        String privada = decodificar("JWT_PRIVATE_KEY");
        if (privada != null) {
            props.put("smallrye.jwt.sign.key", privada);
            props.put("smallrye.jwt.sign.key.location", "");
        }
    }

    private static String decodificar(String variavel) {
        String base64 = System.getenv(variavel);
        if (base64 == null || base64.isBlank()) return null;
        try {
            return new String(Base64.getDecoder().decode(base64.trim()), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(variavel + " precisa ser o arquivo .pem em base64 (openssl base64 -A -in chave.pem)", e);
        }
    }

    @Override
    public Map<String, String> getProperties() { return props; }

    @Override
    public Set<String> getPropertyNames() { return props.keySet(); }

    @Override
    public String getValue(String name) { return props.get(name); }

    @Override
    public String getName() { return "jwt-keys-env"; }

    @Override
    public int getOrdinal() { return 275; }
}
