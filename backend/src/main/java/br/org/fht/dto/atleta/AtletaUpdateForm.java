package br.org.fht.dto.atleta;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Campos editáveis de um atleta (dados textuais).
 * Não altera documentos, status, CPF nem clube — só o cadastro básico.
 * Campos nulos são ignorados (atualização parcial).
 */
@Schema(description = "Campos editáveis do atleta (dados textuais). Campos nulos são ignorados.")
public record AtletaUpdateForm(
        String nomeCompleto,
        @Schema(description = "Data de nascimento (yyyy-MM-dd)", example = "2000-05-15") String dataNascimento,
        @Schema(description = "Sexo", enumeration = {"M", "F"}) String sexo,
        String rg,
        String telefone,
        String email,
        String cidade,
        String ufResidencia,
        String posicao,
        String categoria,
        Boolean transferencia,
        String clubeAnterior,

        /* Responsável legal — permite regularizar um menor cadastrado sem esses dados
           (cadastros anteriores à V12 ficariam travados: a aprovação exige o consentimento). */
        @Schema(description = "Nome do responsável legal (menores)") String responsavelNome,
        @Schema(description = "CPF do responsável legal") String responsavelCpf,
        @Schema(description = "Parentesco", enumeration = {"Mãe", "Pai", "Tutor legal", "Outro"}) String responsavelParentesco,
        @Schema(description = "E-mail do responsável legal") String responsavelEmail,
        @Schema(description = "Telefone do responsável legal") String responsavelTelefone,
        @Schema(description = "Aceite do termo pelo responsável. Registra o consentimento "
                + "CADASTRO_ATLETA_MENOR se ainda não houver um ativo.") Boolean consentimentoCadastro
) {}
