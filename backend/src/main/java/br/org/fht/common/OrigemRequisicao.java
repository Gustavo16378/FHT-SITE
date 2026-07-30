package br.org.fht.common;

import jakarta.ws.rs.core.HttpHeaders;

/**
 * IP e user-agent de quem fez a requisição — evidência anexada ao consentimento LGPD
 * (art. 6, X: responsabilização/prestação de contas).
 */
public record OrigemRequisicao(String ip, String userAgent) {

    private static final int MAX_USER_AGENT = 512;

    public static OrigemRequisicao de(HttpHeaders headers, String remoteAddress) {
        // Atrás de proxy (Railway/Cloudflare) o IP real vem no X-Forwarded-For — o primeiro da lista.
        String forwarded = headers.getHeaderString("X-Forwarded-For");
        String ip = (forwarded != null && !forwarded.isBlank())
                ? forwarded.split(",")[0].trim()
                : remoteAddress;

        String userAgent = headers.getHeaderString("User-Agent");
        if (userAgent != null && userAgent.length() > MAX_USER_AGENT) {
            userAgent = userAgent.substring(0, MAX_USER_AGENT);
        }

        return new OrigemRequisicao(ip, userAgent);
    }
}
