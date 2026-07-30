package br.org.fht.dto.atleta;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(description = "Dados de um atleta filiado ou em processo de filiação")
public record AtletaResponseDTO(
        @Schema(description = "UUID único do atleta") UUID id,
        @Schema(description = "UUID do clube") UUID clubeId,
        @Schema(description = "Nome completo", example = "Carlos Eduardo Lima") String nomeCompleto,
        @Schema(description = "Data de nascimento", example = "2000-05-15") LocalDate dataNascimento,
        @Schema(description = "Sexo", enumeration = {"M", "F"}) String sexo,
        @Schema(description = "CPF", example = "123.456.789-00") String cpf,
        @Schema(description = "Número do RG") String rg,
        @Schema(description = "Telefone de contato") String telefone,
        @Schema(description = "E-mail pessoal") String email,
        @Schema(description = "Cidade de residência") String cidade,
        @Schema(description = "UF de residência") String ufResidencia,
        @Schema(description = "Posição em quadra") String posicao,
        @Schema(description = "Categoria etária", enumeration = {"MINI", "MIRIM", "INFANTIL", "INFANTO", "JUVENIL", "JUNIOR", "ADULTO", "MASTER"}) String categoria,
        @Schema(description = "Indica se é transferência de outro clube") boolean transferencia,
        @Schema(description = "Nome do clube anterior") String clubeAnterior,
        @Schema(description = "Atleta é menor de idade hoje (LGPD art. 14)") boolean menorDeIdade,
        @Schema(description = "Nome do responsável legal (menores)") String responsavelNome,
        @Schema(description = "CPF do responsável legal") String responsavelCpf,
        @Schema(description = "Parentesco do responsável") String responsavelParentesco,
        @Schema(description = "E-mail do responsável legal") String responsavelEmail,
        @Schema(description = "Telefone do responsável legal") String responsavelTelefone,
        @Schema(description = "URL da foto 3x4 (R2)") String fotoUrl,
        @Schema(description = "URL do RG digitalizado (R2)") String rgUrl,
        @Schema(description = "URL do comprovante de residência (R2)") String comprovanteResidenciaUrl,
        @Schema(description = "URL do comprovante de pagamento Pix (R2) — obrigatório para aprovação") String comprovantePagamentoUrl,
        @Schema(description = "Status atual", enumeration = {"AGUARDANDO_PAGAMENTO", "AGUARDANDO_APROVACAO", "ATIVO", "REJEITADO", "SUSPENSO"}) String status,
        @Schema(description = "Motivo da rejeição") String motivoRejeicao,
        @Schema(description = "Prazo para anexar o comprovante — vencido, o cadastro é apagado") LocalDateTime prazoPagamentoAte,
        @Schema(description = "Valor da taxa de filiação", example = "35.00") BigDecimal taxaValor,
        @Schema(description = "Ano de referência da taxa", example = "2025") Integer taxaAno,
        @Schema(description = "Consentimentos LGPD registrados") List<ConsentimentoDTO> consentimentos,
        @Schema(description = "Data/hora do cadastro") LocalDateTime createdAt
) {}
