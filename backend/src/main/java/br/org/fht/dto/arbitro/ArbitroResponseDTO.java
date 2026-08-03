package br.org.fht.dto.arbitro;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Árbitro (visão completa do admin)")
public record ArbitroResponseDTO(
        UUID id,
        String nome,
        String cpf,
        String rg,
        String orgaoEmissor,
        LocalDate dataNascimento,
        String sexo,
        String telefone,
        String email,
        String cidade,
        String uf,
        String fotoUrl,
        String rgUrl,
        @Schema(description = "Nível oficial credenciado", enumeration = {"Regional", "Estadual B", "Estadual A", "Nacional"}) String nivel,
        String registro,
        String inicioArbitragem,
        String formacao,
        @Schema(description = "CREDENCIADO/SUSPENSO no fluxo atual; PENDENTE e REJEITADO só existem "
                + "em registros do antigo formulário público de solicitação",
                enumeration = {"CREDENCIADO", "SUSPENSO", "PENDENTE", "REJEITADO"}) String status,
        String motivoRejeicao,
        LocalDateTime createdAt
) {}
