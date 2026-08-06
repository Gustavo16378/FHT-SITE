package br.org.fht.common;

import br.org.fht.exception.ValidationException;

/**
 * Guardas de campo aplicadas ANTES do INSERT.
 *
 * <p>Sem isso o estouro de coluna só aparece no Postgres, cai no fallback do
 * {@code GlobalExceptionMapper} e o usuário lê "Erro interno do servidor" — sem saber qual campo
 * errou, depois de ter preenchido o formulário inteiro. Com isso ele recebe 422 dizendo o campo.
 *
 * <p>A regra nasceu no cadastro de competição e estava presa lá dentro; foi promovida pra cá quando
 * o mesmo defeito derrubou o cadastro de atleta com mais de uma posição.
 */
public final class Campos {

    private Campos() {}

    /** Recusa valor maior que a coluna comporta. Nulo passa — quem exige presença é o {@code obrigatorio}. */
    public static String tamanho(String valor, int max, String campo) {
        if (valor != null && valor.length() > max) {
            throw new ValidationException(campo, "Campo excede o limite de " + max + " caracteres");
        }
        return valor;
    }

    /**
     * Exige presença e recusa estouro de coluna, devolvendo já sem espaços nas pontas.
     * Use nas colunas NOT NULL — é onde a ausência vira 500 em vez de mensagem.
     */
    public static String obrigatorio(String valor, int max, String campo, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new ValidationException(campo, mensagem);
        }
        return tamanho(valor.trim(), max, campo);
    }
}
