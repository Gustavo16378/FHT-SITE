package br.org.fht.dto.clube;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Dados de um clube filiado ou em processo de filiação")
public record ClubeResponseDTO(
        @Schema(description = "UUID único do clube") UUID id,
        @Schema(description = "Nome completo", example = "Palmares Handebol Clube") String nome,
        @Schema(description = "Cidade sede", example = "Palmas") String cidade,
        @Schema(description = "UF da cidade sede", example = "TO") String uf,
        @Schema(description = "Sigla", example = "PHC") String sigla,
        @Schema(description = "CNPJ", example = "12.345.678/0001-99") String cnpj,
        @Schema(description = "Nome do representante legal") String representanteNome,
        @Schema(description = "E-mail do representante") String representanteEmail,
        @Schema(description = "Telefone do representante") String representanteTelefone,
        @Schema(description = "URL da ata de fundação (R2)") String ataFundacaoUrl,
        @Schema(description = "URL do estatuto social (R2)") String estatutoUrl,
        @Schema(description = "Status atual", enumeration = {"PENDENTE", "ATIVO", "REJEITADO", "SUSPENSO"}) String status,
        @Schema(description = "Motivo da rejeição — preenchido quando status = REJEITADO") String motivoRejeicao,
        @Schema(description = "Data/hora da solicitação") LocalDateTime createdAt,
        @Schema(description = "Data/hora da última atualização") LocalDateTime updatedAt
) {}
