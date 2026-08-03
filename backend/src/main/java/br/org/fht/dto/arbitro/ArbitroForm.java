package br.org.fht.dto.arbitro;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

/**
 * Ficha do arbitro preenchida pela COMISSAO DE ARBITRAGEM da FHT.
 *
 * Substituiu o formulario publico "quero ser arbitro": ninguem mais se auto-declara. Por isso os
 * campos aqui sao os oficiais (nivel, registro, formacao) e nao os auto-declarados que existiam
 * antes (ja e arbitro?, tem experiencia?, curso de interesse) — esses sairam na migration V14.
 * Campos nulos sao ignorados na edicao (PUT parcial).
 */
@Schema(description = "Ficha de árbitro — cadastro interno da federação")
public class ArbitroForm {

    @RestForm @Schema(description = "Nome completo", example = "Marcos Vinicius Alves", required = true)
    public String nomeCompleto;

    @RestForm @Schema(description = "CPF", example = "123.456.789-00")
    public String cpf;

    @RestForm @Schema(description = "RG")
    public String rg;

    @RestForm @Schema(description = "Órgão emissor do RG", example = "SSP/TO")
    public String orgaoEmissor;

    @RestForm @Schema(description = "Data de nascimento (AAAA-MM-DD)", example = "1990-05-11")
    public String dataNascimento;

    @RestForm @Schema(description = "Sexo", example = "Masculino")
    public String sexo;

    @RestForm @Schema(description = "Telefone / WhatsApp", example = "(63) 98888-7777")
    public String telefone;

    @RestForm @Schema(description = "E-mail", example = "arbitro@email.com")
    public String email;

    @RestForm @Schema(description = "Cidade", example = "Palmas")
    public String cidade;

    @RestForm @Schema(description = "UF", example = "TO")
    public String uf;

    /* ── Credenciamento: o que a federação define ── */

    @RestForm @Schema(description = "Nível oficial",
            enumeration = {"Regional", "Estadual B", "Estadual A", "Nacional"})
    public String nivel;

    @RestForm @Schema(description = "Número de registro na federação", example = "ARB-TO-0042")
    public String registro;

    @RestForm @Schema(description = "Ano de início na arbitragem", example = "2016")
    public String inicioArbitragem;

    @RestForm @Schema(description = "Formação / cursos", example = "Curso de Formação CBHb 2016")
    public String formacao;

    @RestForm("foto")
    @Schema(description = "Foto do árbitro — aparece na lista pública do site")
    public FileUpload foto;

    @RestForm("rgDoc")
    @Schema(description = "RG digitalizado — uso interno, não vai para o site")
    public FileUpload rgDoc;
}
