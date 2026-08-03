package br.org.fht.dto.clube;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Pessoa ligada ao clube (representantes e técnico)")
public record ClubePessoaDTO(
        UUID id,
        String nome,
        String cpf,
        @Schema(enumeration = {"REPRESENTANTE", "TECNICO", "AUXILIAR"}) String funcao,
        String cargo,
        String email,
        String telefone,
        @Schema(description = "Representante que responde oficialmente pelo clube — é o dono do login")
        boolean principal
) {}
