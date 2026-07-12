package br.org.fht.dto.clube;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Campos editáveis de um clube (dados textuais).
 * Não altera status, documentos nem a filiação — só o cadastro básico.
 * Campos nulos são ignorados (atualização parcial).
 */
@Schema(description = "Campos editáveis do clube. Campos nulos são ignorados.")
public record ClubeUpdateForm(
        String nome,
        String cidade,
        String uf,
        String sigla,
        String cnpj,
        String representanteNome,
        String representanteEmail,
        String representanteTelefone,
        String representanteCargo
) {}
