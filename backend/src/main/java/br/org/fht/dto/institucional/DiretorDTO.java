package br.org.fht.dto.institucional;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Membro da diretoria (dados institucionais, públicos)")
public record DiretorDTO(
        @Schema(description = "UUID do diretor") UUID id,
        @Schema(description = "Nome completo") String nome,
        @Schema(description = "Cargo", example = "Presidente") String cargo,
        @Schema(description = "Área de atuação", example = "Gestão Geral") String area,
        @Schema(description = "Mandato", example = "2023–2027") String mandato,
        @Schema(description = "E-mail institucional") String email,
        @Schema(description = "Telefone institucional") String telefone,
        @Schema(description = "Na diretoria desde", example = "Fevereiro/2023") String desde,
        @Schema(description = "Bio/currículo (parágrafos separados por linha em branco)") String bio,
        @Schema(description = "URL da foto") String fotoUrl,
        @Schema(description = "Ordem de exibição") int ordem,
        @Schema(description = "Data/hora de criação") LocalDateTime createdAt
) {}
