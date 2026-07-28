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
        String comprovanteEscolarUrl,
        boolean jaArbitro,
        String nivelAtual,
        String federacaoOrigem,
        boolean temExperiencia,
        String descricaoExperiencia,
        boolean disponibilidadeFds,
        String cursoInteresse,
        @Schema(description = "Nível oficial credenciado", enumeration = {"Regional", "Estadual B", "Estadual A", "Nacional"}) String nivel,
        String registro,
        String inicioArbitragem,
        String formacao,
        @Schema(enumeration = {"PENDENTE", "CREDENCIADO", "REJEITADO", "SUSPENSO"}) String status,
        String motivoRejeicao,
        LocalDateTime createdAt
) {}
