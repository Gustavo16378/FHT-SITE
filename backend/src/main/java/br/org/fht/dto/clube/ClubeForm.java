package br.org.fht.dto.clube;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Schema(description = "Formulário multipart para solicitação de filiação de clube")
public class ClubeForm {

    @RestForm
    @Schema(description = "Nome completo do clube", example = "Palmares Handebol Clube", required = true)
    public String nome;

    @RestForm
    @Schema(description = "Cidade sede", example = "Palmas", required = true)
    public String cidade;

    @RestForm
    @Schema(description = "UF da cidade sede", example = "TO", required = true)
    public String uf;

    @RestForm
    @Schema(description = "Sigla do clube", example = "PHC")
    public String sigla;

    @RestForm
    @Schema(description = "CNPJ do clube", example = "12.345.678/0001-99", required = true)
    public String cnpj;

    @RestForm
    @Schema(description = "Nome completo do representante legal", example = "João da Silva", required = true)
    public String representanteNome;

    @RestForm
    @Schema(description = "E-mail do representante", example = "joao@meuclube.to", required = true)
    public String representanteEmail;

    @RestForm
    @Schema(description = "Telefone do representante", example = "(63) 99999-0001", required = true)
    public String representanteTelefone;

    @RestForm
    @Schema(description = "Cargo do representante no clube", example = "Presidente")
    public String representanteCargo;

    @RestForm("ata")
    @Schema(description = "Ata de fundação (PDF, máx. 10 MB)", required = true)
    public FileUpload ata;

    @RestForm("estatuto")
    @Schema(description = "Estatuto social (PDF, máx. 10 MB)", required = true)
    public FileUpload estatuto;
}
