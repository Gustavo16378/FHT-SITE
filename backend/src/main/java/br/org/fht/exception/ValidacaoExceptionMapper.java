package br.org.fht.exception;

import br.org.fht.common.ApiResponse;
import io.quarkus.hibernate.validator.runtime.jaxrs.ResteasyReactiveViolationException;
import jakarta.annotation.Priority;
import jakarta.validation.ConstraintViolation;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.stream.Collectors;

/**
 * Erros de {@code @Valid} devolvidos no MESMO envelope do resto da API.
 *
 * <p>O {@link GlobalExceptionMapper} já trata {@code ConstraintViolationException}, mas nunca era
 * chamado para isso: o Quarkus registra um mapper próprio para o subtipo exato
 * {@code ResteasyReactiveViolationException}, que vence por ser mais específico e responde no
 * formato dele ({@code {"title":"Constraint Violation","violations":[...]}}). O cliente da API,
 * que só sabe ler {@code {data, message, status}}, caía no fallback e mostrava "Erro 400" — sem
 * dizer o que estava errado. Aparecia em todo endpoint com {@code @Valid}, inclusive no login.
 *
 * <p>A prioridade explícita é o que coloca este mapper à frente do embutido.
 */
@Provider
@Priority(1)
public class ValidacaoExceptionMapper implements ExceptionMapper<ResteasyReactiveViolationException> {

    @Override
    public Response toResponse(ResteasyReactiveViolationException ex) {
        String msg = ex.getConstraintViolations().stream()
                .map(ValidacaoExceptionMapper::descrever)
                .collect(Collectors.joining(", "));

        if (msg.isBlank()) msg = "Dados inválidos";

        return Response.status(400).entity(ApiResponse.error(msg, 400)).build();
    }

    /**
     * O caminho da violação vem como "enviar.form.mensagem" — nome do método, do parâmetro e só
     * então o campo. Para quem lê a mensagem na tela, só o último trecho interessa.
     */
    private static String descrever(ConstraintViolation<?> v) {
        String caminho = v.getPropertyPath() == null ? "" : v.getPropertyPath().toString();
        int ponto = caminho.lastIndexOf('.');
        String campo = ponto >= 0 ? caminho.substring(ponto + 1) : caminho;
        return campo.isBlank() ? v.getMessage() : campo + ": " + v.getMessage();
    }
}
