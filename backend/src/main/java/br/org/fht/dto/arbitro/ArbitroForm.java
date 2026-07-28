package br.org.fht.dto.arbitro;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

/**
 * Formulário multipart da solicitação pública "Quero ser árbitro" (ArbitroForm.tsx).
 * Os booleanos chegam como "true"/"false" (FormData) e a data como ISO (yyyy-MM-dd).
 */
@Schema(description = "Solicitação pública para se tornar árbitro")
public class ArbitroForm {

    @RestForm public String nomeCompleto;
    @RestForm public String dataNascimento;
    @RestForm public String sexo;
    @RestForm public String cpf;
    @RestForm public String rg;
    @RestForm public String orgaoEmissor;
    @RestForm public String telefone;
    @RestForm public String email;
    @RestForm public String cidade;
    @RestForm public String uf;

    @RestForm public String jaArbitro;
    @RestForm public String nivelAtual;
    @RestForm public String federacaoOrigem;
    @RestForm public String temExperiencia;
    @RestForm public String descricaoExperiencia;
    @RestForm public String disponibilidadeFds;
    @RestForm public String cursoInteresse;

    @RestForm("foto")
    @Schema(description = "Foto 3x4 (imagem)")
    public FileUpload foto;

    @RestForm("rgDoc")
    @Schema(description = "RG digitalizado (PDF ou imagem)")
    public FileUpload rgDoc;

    @RestForm("compEscolar")
    @Schema(description = "Comprovante de ensino médio (PDF)")
    public FileUpload compEscolar;
}
