package br.org.fht.dto.pagamento;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

/**
 * Envio do pagamento em lote: N atletas, UM comprovante.
 * O clube escolhe quem entra — pagar parcial e comum quando o caixa nao da para todos.
 */
@Schema(description = "Pagamento em lote da anuidade")
public class PagamentoLoteForm {

    @RestForm
    @Schema(description = "IDs dos atletas separados por vírgula", required = true,
            example = "a1b2...,c3d4...")
    public String atletaIds;

    @RestForm
    @Schema(description = "Observação do clube para a federação (opcional)")
    public String observacao;

    @RestForm("comprovante")
    @Schema(description = "Comprovante do Pix (imagem ou PDF)", required = true)
    public FileUpload comprovante;
}
