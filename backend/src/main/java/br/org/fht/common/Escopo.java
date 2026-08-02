package br.org.fht.common;

import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.UUID;

/**
 * Decide o alcance de quem esta autenticado.
 *
 * ⚠️ Regra: acesso amplo e ALLOWLIST — so ADMIN_FHT ve tudo. O padrao anterior era o inverso
 * ("se for ADMIN_CLUBE restringe, senao libera geral"), que funciona por acidente enquanto so
 * existem dois papeis: no dia em que entrar qualquer papel novo de clube (tecnico, 2o
 * representante), ele cairia no "senao" e enxergaria os dados de TODOS os clubes — inclusive de
 * atletas menores. Nunca volte a decidir escopo por "quem NAO e".
 */
public final class Escopo {

    public static final String ADMIN_FHT = "ADMIN_FHT";

    private Escopo() {}

    /** Unico papel com alcance sobre toda a federacao. */
    public static boolean ehAdminFederacao(JsonWebToken jwt) {
        return ADMIN_FHT.equals((String) jwt.getClaim("role"));
    }

    /**
     * Clube do usuario autenticado. Falha com 403 se o token nao trouxer clubeId — quem nao e
     * ADMIN_FHT e nao tem clube nao pode ver nada, em vez de ver tudo.
     */
    public static UUID clubeDoToken(JsonWebToken jwt) {
        String id = jwt.getClaim("clubeId");
        if (id == null || id.isBlank()) {
            throw new WebApplicationException("Usuário sem clube associado", 403);
        }
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException("Clube inválido no token", 403);
        }
    }
}
