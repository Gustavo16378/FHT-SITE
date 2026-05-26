package br.org.fht.exception;

import br.org.fht.common.ApiResponse;
import io.sentry.Sentry;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.util.stream.Collectors;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Exception ex) {
        if (ex instanceof WebApplicationException wae) {
            int status = wae.getResponse().getStatus();
            return Response.status(status)
                    .entity(ApiResponse.error(ex.getMessage(), status))
                    .build();
        }

        if (ex instanceof ValidationException ve) {
            String msg = ve.getField() != null
                    ? ve.getField() + ": " + ve.getMessage()
                    : ve.getMessage();
            return Response.status(422)
                    .entity(ApiResponse.error(msg, 422))
                    .build();
        }

        if (ex instanceof ConstraintViolationException cve) {
            String msg = cve.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));
            return Response.status(400)
                    .entity(ApiResponse.error(msg, 400))
                    .build();
        }

        LOG.errorf(ex, "Erro interno não tratado: %s", ex.getMessage());
        Sentry.captureException(ex);

        return Response.status(500)
                .entity(ApiResponse.error("Erro interno do servidor", 500))
                .build();
    }
}
