package br.org.fht.dto.atleta;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Schema(description = "Formulário multipart para cadastro de atleta")
public class AtletaForm {

    @RestForm @Schema(description = "Nome completo do atleta", example = "Carlos Eduardo Lima", required = true)
    public String nomeCompleto;

    @RestForm @Schema(description = "Data de nascimento (YYYY-MM-DD)", example = "2000-05-15", required = true)
    public String dataNascimento;

    @RestForm @Schema(description = "Sexo", enumeration = {"M", "F"}, required = true)
    public String sexo;

    @RestForm @Schema(description = "CPF (apenas dígitos)", example = "12345678900", required = true)
    public String cpf;

    @RestForm @Schema(description = "Número do RG", example = "1234567", required = true)
    public String rg;

    @RestForm @Schema(description = "Órgão emissor do RG", example = "SSP/TO")
    public String rgOrgaoEmissor;

    @RestForm @Schema(description = "Cidade de naturalidade", example = "Palmas")
    public String naturalidadeCidade;

    @RestForm @Schema(description = "UF de naturalidade", example = "TO")
    public String naturalidadeUf;

    @RestForm @Schema(description = "Telefone de contato", example = "(63) 98888-7777")
    public String telefone;

    @RestForm @Schema(description = "E-mail pessoal", example = "carlos@email.com")
    public String email;

    @RestForm @Schema(description = "CEP", example = "77000-000")
    public String cep;

    @RestForm @Schema(description = "Logradouro", example = "Rua das Flores")
    public String logradouro;

    @RestForm @Schema(description = "Número do endereço", example = "123")
    public String numero;

    @RestForm @Schema(description = "Cidade de residência", example = "Palmas", required = true)
    public String cidade;

    @RestForm @Schema(description = "UF de residência", example = "TO", required = true)
    public String ufResidencia;

    @RestForm @Schema(description = "Posição em quadra", example = "Armador")
    public String posicao;

    @RestForm @Schema(description = "Categoria etária", enumeration = {"MINI", "MIRIM", "INFANTIL", "INFANTO", "JUVENIL", "JUNIOR", "ADULTO", "MASTER"}, required = true)
    public String categoria;

    @RestForm @Schema(description = "É transferência? ('true' ou 'false')", example = "false")
    public String isTransferencia;

    @RestForm @Schema(description = "Nome do clube anterior (obrigatório se isTransferencia = true)")
    public String clubeAnterior;

    @RestForm("foto")
    @Schema(description = "Foto 3x4 (JPG/PNG, máx. 2 MB)", required = true)
    public FileUpload foto;

    @RestForm("rg")
    @Schema(description = "Documento RG digitalizado (PDF/JPG, máx. 5 MB)", required = true)
    public FileUpload rgDoc;

    @RestForm("comprovanteResidencia")
    @Schema(description = "Comprovante de residência (PDF/JPG, máx. 5 MB)", required = true)
    public FileUpload comprovanteResidencia;

    @RestForm("comprovantePix")
    @Schema(description = "Comprovante do pagamento Pix da taxa de filiação (PDF/JPG, máx. 5 MB)")
    public FileUpload comprovantePix;
}
