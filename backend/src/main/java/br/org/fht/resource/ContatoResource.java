package br.org.fht.resource;

import br.org.fht.common.ApiResponse;
import br.org.fht.dto.contato.ContatoForm;
import br.org.fht.service.EmailService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * Canal "Fale com a FHT" do site público.
 *
 * <p>Antes disso o formulário do site apenas marcava a tela como enviada e exibia "MENSAGEM
 * ENVIADA! Nossa equipe retornará em breve" — sem nenhuma requisição por trás. A federação perdia
 * contato de clube, de imprensa e de quem queria ser árbitro sem nunca saber que existiu.
 *
 * <p>Público de propósito (ausência de {@code @RolesAllowed}): quem escreve não tem login.
 * ⚠️ Sem rate limit — está no bloco de endurecimento junto com o cadastro público de clube.
 */
@Path("/api/contato")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Contato", description = "Formulário público de contato com a federação")
public class ContatoResource {

    @Inject EmailService emailService;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Enviar mensagem à federação",
            description = "Encaminha a mensagem por e-mail à caixa institucional. Nada é armazenado.")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Mensagem encaminhada"),
            @APIResponse(responseCode = "422", description = "Campos inválidos"),
            @APIResponse(responseCode = "503", description = "Canal de e-mail indisponível no momento")
    })
    public Response enviar(@Valid ContatoForm form) {
        boolean enviado = emailService.encaminharContato(
                form.nome(), form.email(), form.telefone(), form.assunto(), form.mensagem());

        // Aqui a falha NÃO pode ser engolida como nos avisos internos: se a mensagem não saiu,
        // dizer que saiu é exatamente o defeito que este endpoint veio corrigir.
        if (!enviado) {
            throw new WebApplicationException(
                    "Não foi possível enviar sua mensagem agora. Tente novamente ou fale conosco pelo WhatsApp.", 503);
        }

        return Response.ok(ApiResponse.ok(null, "Mensagem enviada com sucesso")).build();
    }
}
