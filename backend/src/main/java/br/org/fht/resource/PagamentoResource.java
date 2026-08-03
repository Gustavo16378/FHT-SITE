package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.pagamento.PagamentoLoteForm;
import br.org.fht.service.PagamentoService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

/**
 * Pagamento da anuidade em lote. O clube junta os atletas pendentes, faz um Pix so e anexa
 * um comprovante; a federacao confere e da baixa. Nao ha gateway — a conferencia e manual.
 */
@Path("/api/pagamentos")
@Produces(MediaType.APPLICATION_JSON)
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Pagamentos", description = "Anuidade dos atletas paga em lote pelo clube")
public class PagamentoResource {

    @Inject PagamentoService pagamentoService;
    @Inject JsonWebToken jwt;

    @GET
    @Path("/pendentes")
    @RolesAllowed("ADMIN_CLUBE")
    @Operation(summary = "Atletas com anuidade em aberto",
            description = "Alimenta o botão de pagamento do painel do clube: quem está devendo e o total.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Pendências do clube"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_CLUBE")
    })
    public Response listarPendentes() {
        return Response.ok(ApiResponse.ok(pagamentoService.listarPendentes(jwt), "OK")).build();
    }

    @POST
    @RolesAllowed("ADMIN_CLUBE")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Enviar pagamento em lote",
            description = "N atletas, 1 comprovante. O clube escolhe quem entra — pagamento parcial é permitido.")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Pagamento enviado, aguardando conferência"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_CLUBE"),
            @APIResponse(responseCode = "422", description = "Nenhum atleta, comprovante ausente ou atleta indisponível")
    })
    public Response enviar(@BeanParam PagamentoLoteForm form) {
        var lote = pagamentoService.enviarPagamento(form, jwt);
        return Response.status(201)
                .entity(ApiResponse.created(lote, "Pagamento enviado. A FHT vai conferir e dar baixa."))
                .build();
    }

    @GET
    @Path("/meus")
    @RolesAllowed("ADMIN_CLUBE")
    @Operation(summary = "Histórico de pagamentos do clube")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Lotes do clube"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido")
    })
    public Response listarDoClube() {
        return Response.ok(ApiResponse.ok(pagamentoService.listarDoClube(jwt), "OK")).build();
    }

    @GET
    @RolesAllowed("ADMIN_FHT")
    @Operation(summary = "Fila de conferência da federação",
            description = "Todos os lotes, com os aguardando baixa primeiro. Cada um traz a lista nominal "
                    + "dos atletas cobertos — é o que a federação confere para dar baixa.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Lotes"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response listarTodos() {
        return Response.ok(ApiResponse.ok(pagamentoService.listarTodos(), "OK")).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @Operation(summary = "Detalhe do pagamento", description = "ADMIN_CLUBE só alcança os próprios lotes.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Dados do lote"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "404", description = "Pagamento não encontrado")
    })
    public Response buscarPorId(
            @Parameter(description = "UUID do lote", required = true) @PathParam("id") UUID id) {
        return Response.ok(ApiResponse.ok(pagamentoService.buscarPorId(id, jwt), "OK")).build();
    }

    @PATCH
    @Path("/{id}/baixar")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Dar baixa no pagamento",
            description = "Confirma o recebimento e ativa os atletas do lote que também estão com a "
                    + "documentação em ordem. Devolve quem foi ativado e quem ficou bloqueado, com o motivo.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Baixa registrada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Pagamento não encontrado"),
            @APIResponse(responseCode = "409", description = "Pagamento já conferido")
    })
    public Response darBaixa(
            @Parameter(description = "UUID do lote", required = true) @PathParam("id") UUID id) {
        var r = pagamentoService.darBaixa(id, jwt);
        String msg = r.bloqueados().isEmpty()
                ? r.ativados().size() + " atleta(s) ativado(s)"
                : r.ativados().size() + " ativado(s), " + r.bloqueados().size() + " aguardando documentação";
        return Response.ok(ApiResponse.ok(r, msg)).build();
    }

    @PATCH
    @Path("/{id}/rejeitar")
    @RolesAllowed("ADMIN_FHT")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Rejeitar pagamento",
            description = "Recusa o comprovante e devolve os atletas para a fila de pendentes.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Pagamento rejeitado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Pagamento não encontrado"),
            @APIResponse(responseCode = "409", description = "Pagamento já teve baixa")
    })
    public Response rejeitar(
            @Parameter(description = "UUID do lote", required = true) @PathParam("id") UUID id,
            MotivoRequest req) {
        return Response.ok(ApiResponse.ok(
                pagamentoService.rejeitar(id, req != null ? req.motivo() : null, jwt),
                "Pagamento rejeitado")).build();
    }

    @Schema(description = "Motivo da rejeição do pagamento")
    public record MotivoRequest(
            @Schema(example = "Comprovante ilegível") String motivo
    ) {}
}
