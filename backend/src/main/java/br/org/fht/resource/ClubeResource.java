package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.clube.ClubeForm;
import br.org.fht.dto.clube.ClubePessoaForm;
import br.org.fht.dto.clube.ClubeResponseDTO;
import br.org.fht.dto.clube.ClubeUpdateForm;
import br.org.fht.service.ClubeService;
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

import java.util.List;
import java.util.UUID;

@Path("/api/clubes")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Clubes", description = "Filiação e gestão de clubes afiliados à FHT")
public class ClubeResource {

    @Inject ClubeService clubeService;
    @Inject JsonWebToken jwt;

    @POST
    @Path("/solicitar")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Solicitar filiação de clube",
            description = "Endpoint público. Envia ata de fundação + estatuto para análise da FHT.")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Solicitação enviada — status PENDENTE"),
            @APIResponse(responseCode = "400", description = "Dados ou arquivos inválidos"),
            @APIResponse(responseCode = "409", description = "CNPJ já cadastrado")
    })
    public Response solicitar(@BeanParam ClubeForm form) {
        ClubeResponseDTO clube = clubeService.solicitar(form);
        return Response.status(201)
                .entity(ApiResponse.created(clube, "Solicitação enviada. A FHT entrará em contato em até 5 dias úteis."))
                .build();
    }

    @GET
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Listar todos os clubes")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Lista de clubes"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT")
    })
    public Response listar() {
        List<ClubeResponseDTO> clubes = clubeService.listar();
        return Response.ok(ApiResponse.ok(clubes, "OK")).build();
    }

    @GET
    @Path("/publico")
    @Operation(summary = "Vitrine pública de clubes",
            description = "Endpoint público. Lista os clubes ATIVOS e visíveis na home, só com dados públicos (sem CNPJ/documentos/contato).")
    @APIResponse(responseCode = "200", description = "Clubes da vitrine")
    public Response listarPublicos() {
        return Response.ok(ApiResponse.ok(clubeService.listarPublicos(), "OK")).build();
    }

    @GET
    @Path("/publico/{id}")
    @Operation(summary = "Detalhe público de um clube",
            description = "Endpoint público para o modal da home: dados públicos + elenco (atletas ativos).")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Detalhe público do clube"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado ou fora da vitrine")
    })
    public Response buscarPublico(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id) {
        return Response.ok(ApiResponse.ok(clubeService.buscarPublico(id), "OK")).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Buscar clube por ID",
            description = "ADMIN_FHT pode buscar qualquer clube. ADMIN_CLUBE só vê o próprio.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Dados do clube"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Sem permissão para este clube"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado")
    })
    public Response buscarPorId(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id) {
        return Response.ok(ApiResponse.ok(clubeService.buscarPorId(id, jwt), "OK")).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Atualizar dados do clube",
            description = "ADMIN_FHT edita qualquer clube; ADMIN_CLUBE só o próprio. Não altera status nem documentos.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Clube atualizado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Sem permissão para este clube"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado")
    })
    public Response atualizar(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id,
            ClubeUpdateForm form) {
        return Response.ok(ApiResponse.ok(clubeService.atualizar(id, form, jwt), "Clube atualizado")).build();
    }

    @PATCH
    @Path("/{id}/aprovar")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Aprovar clube",
            description = "Muda status para ATIVO e cria credenciais ADMIN_CLUBE para o representante.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Clube aprovado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado"),
            @APIResponse(responseCode = "409", description = "Clube já aprovado")
    })
    public Response aprovar(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id) {
        clubeService.aprovar(id);
        return Response.ok(ApiResponse.ok(null, "Clube aprovado com sucesso")).build();
    }

    @PATCH
    @Path("/{id}/rejeitar")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Rejeitar solicitação de clube")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Clube rejeitado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado")
    })
    public Response rejeitar(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id,
            MotivoRequest req) {
        clubeService.rejeitar(id, req != null ? req.motivo() : null);
        return Response.ok(ApiResponse.ok(null, "Clube rejeitado")).build();
    }

    @PATCH
    @Path("/{id}/suspender")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Suspender clube",
            description = "Muda status de ATIVO para SUSPENSO.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Clube suspenso"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado"),
            @APIResponse(responseCode = "409", description = "Clube não está ativo")
    })
    public Response suspender(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id) {
        clubeService.suspender(id);
        return Response.ok(ApiResponse.ok(null, "Clube suspenso")).build();
    }

    @PATCH
    @Path("/{id}/reativar")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reativar clube",
            description = "Muda status de SUSPENSO de volta para ATIVO.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Clube reativado"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado"),
            @APIResponse(responseCode = "409", description = "Clube não está suspenso")
    })
    public Response reativar(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id) {
        clubeService.reativar(id);
        return Response.ok(ApiResponse.ok(null, "Clube reativado")).build();
    }

    @PATCH
    @Path("/{id}/vitrine")
    @RolesAllowed("ADMIN_FHT")
    @SecurityRequirement(name = "BearerAuth")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Mostrar/ocultar clube na vitrine da home",
            description = "Liga/desliga o clube da vitrine pública. Não altera o status — o clube segue ATIVO.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Vitrine atualizada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Apenas ADMIN_FHT"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado")
    })
    public Response definirVitrine(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id,
            VitrineRequest req) {
        boolean visivel = req == null || req.visivel() == null || req.visivel();
        clubeService.definirVitrine(id, visivel);
        return Response.ok(ApiResponse.ok(null, visivel ? "Clube exibido na home" : "Clube ocultado da home")).build();
    }

    /* ───────────────── pessoas do clube (representantes e técnico) ───────────────── */

    @GET
    @Path("/{id}/pessoas")
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Listar pessoas do clube",
            description = "Representantes e técnico. ADMIN_CLUBE só alcança o próprio clube.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Lista de pessoas"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Sem permissão sobre este clube")
    })
    public Response listarPessoas(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id) {
        return Response.ok(ApiResponse.ok(clubeService.listarPessoas(id, jwt), "OK")).build();
    }

    @POST
    @Path("/{id}/pessoas")
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Adicionar pessoa ao clube",
            description = "Cadastra 2º representante, técnico ou auxiliar. São dados cadastrais: "
                    + "nesta etapa ninguém aqui recebe login próprio.")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Pessoa adicionada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Sem permissão sobre este clube"),
            @APIResponse(responseCode = "404", description = "Clube não encontrado"),
            @APIResponse(responseCode = "422", description = "Dados inválidos")
    })
    public Response adicionarPessoa(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id,
            ClubePessoaForm form) {
        var pessoa = clubeService.adicionarPessoa(id, form, jwt);
        return Response.status(201).entity(ApiResponse.created(pessoa, "Pessoa adicionada")).build();
    }

    @PUT
    @Path("/{id}/pessoas/{pessoaId}")
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @Consumes(MediaType.APPLICATION_JSON)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Editar pessoa do clube", description = "Atualização parcial.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Pessoa atualizada"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Sem permissão sobre este clube"),
            @APIResponse(responseCode = "404", description = "Pessoa não encontrada")
    })
    public Response atualizarPessoa(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id,
            @Parameter(description = "UUID da pessoa", required = true) @PathParam("pessoaId") UUID pessoaId,
            ClubePessoaForm form) {
        return Response.ok(ApiResponse.ok(
                clubeService.atualizarPessoa(id, pessoaId, form, jwt), "Pessoa atualizada")).build();
    }

    @DELETE
    @Path("/{id}/pessoas/{pessoaId}")
    @RolesAllowed({"ADMIN_FHT", "ADMIN_CLUBE"})
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Remover pessoa do clube",
            description = "O representante principal não pode ser removido — ele responde pela filiação.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Pessoa removida"),
            @APIResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @APIResponse(responseCode = "403", description = "Sem permissão sobre este clube"),
            @APIResponse(responseCode = "404", description = "Pessoa não encontrada"),
            @APIResponse(responseCode = "409", description = "Tentou remover o representante principal")
    })
    public Response removerPessoa(
            @Parameter(description = "UUID do clube", required = true) @PathParam("id") UUID id,
            @Parameter(description = "UUID da pessoa", required = true) @PathParam("pessoaId") UUID pessoaId) {
        clubeService.removerPessoa(id, pessoaId, jwt);
        return Response.ok(ApiResponse.ok(null, "Pessoa removida")).build();
    }

    @Schema(description = "Motivo da rejeição")
    public record MotivoRequest(
            @Schema(description = "Texto explicando o motivo", example = "Documentação incompleta")
            String motivo
    ) {}

    @Schema(description = "Estado da vitrine do clube")
    public record VitrineRequest(
            @Schema(description = "true = aparece na home; false = oculto", example = "false")
            Boolean visivel
    ) {}
}
