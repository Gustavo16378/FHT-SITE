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

    /**
     * Recusa valor maior que a coluna comporta e devolve sem espaços nas pontas.
     * Nulo passa — quem exige presença é o {@code obrigatorio}.
     */
    public static String tamanho(String valor, int max, String campo) {
        if (valor == null) return null;
        // Mesmo trim do obrigatorio: sem ele, o mesmo campo era gravado aparado no cadastro e
        // com espaços na edição, e a busca deixava de encontrar o registro.
        String limpo = valor.trim();
        if (limpo.length() > max) {
            throw new ValidationException(campo, "Campo excede o limite de " + max + " caracteres");
        }
        return limpo;
    }

    /**
     * Exige presença e recusa estouro de coluna, devolvendo já sem espaços nas pontas.
     * Use nas colunas NOT NULL — é onde a ausência vira 500 em vez de mensagem.
     */
    public static String obrigatorio(String valor, int max, String campo, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new ValidationException(campo, mensagem);
        }
        return tamanho(valor, max, campo);
    }

    /**
     * Valida e normaliza um endereço de e-mail que serve de login.
     *
     * <p>Não é validação rigorosa de RFC — é a guarda que impede o caso concreto: gravar em branco
     * ou sem formato de e-mail num campo que É a credencial de acesso, trancando a pessoa do lado
     * de fora sem nenhum fluxo de recuperação para trazê-la de volta.
     */
    public static String email(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new ValidationException(campo, "E-mail é obrigatório");
        }
        String limpo = valor.trim().toLowerCase();
        if (limpo.length() > 255 || !limpo.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s.]{2,}")) {
            throw new ValidationException(campo, "E-mail inválido");
        }
        return limpo;
    }
}
