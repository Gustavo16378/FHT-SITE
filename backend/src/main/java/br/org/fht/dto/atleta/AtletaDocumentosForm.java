package br.org.fht.dto.atleta;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

/**
 * Anexo de documentos após o cadastro. Existe porque o comprovante Pix costuma chegar
 * depois (o atleta paga e manda pro clube) e porque foto/comprovante de residência são
 * opcionais no cadastro. Ver docs/MODULO-ATLETA-FLUXO.md §2.
 */
@Schema(description = "Formulário multipart para anexar documentos a um atleta já cadastrado")
public class AtletaDocumentosForm {

    @RestForm("foto")
    @Schema(description = "Foto 3x4 (JPG/PNG)")
    public FileUpload foto;

    @RestForm("rgDoc")
    @Schema(description = "Documento RG digitalizado (PDF/JPG)")
    public FileUpload rgDoc;

    @RestForm("comprovanteResidencia")
    @Schema(description = "Comprovante de residência (PDF/JPG)")
    public FileUpload comprovanteResidencia;

    @RestForm("comprovantePix")
    @Schema(description = "Comprovante do pagamento Pix — ao anexar, o atleta sai de AGUARDANDO_PAGAMENTO "
            + "e entra na fila de aprovação da federação")
    public FileUpload comprovantePix;
}
