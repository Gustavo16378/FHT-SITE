package br.org.fht.dto.clube;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Cadastro/edição de pessoa do clube. Campos nulos são ignorados na edição.")
public record ClubePessoaForm(
        @Schema(description = "Nome completo", required = true) String nome,
        @Schema(description = "CPF", example = "123.456.789-00") String cpf,
        @Schema(description = "Função no clube", enumeration = {"REPRESENTANTE", "TECNICO", "AUXILIAR"}, required = true)
        String funcao,
        @Schema(description = "Cargo (ex.: Presidente, Vice, Técnico principal)") String cargo,
        String email,
        String telefone
) {}
