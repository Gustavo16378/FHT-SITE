package br.org.fht.dto.institucional;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Dados para criar/editar um membro da diretoria")
public record DiretorForm(
        @Schema(description = "Nome completo", required = true) String nome,
        @Schema(description = "Cargo", required = true) String cargo,
        @Schema(description = "Área de atuação") String area,
        @Schema(description = "Mandato", example = "2023–2027") String mandato,
        @Schema(description = "E-mail institucional") String email,
        @Schema(description = "Telefone institucional") String telefone,
        @Schema(description = "Na diretoria desde") String desde,
        @Schema(description = "Bio/currículo") String bio,
        @Schema(description = "URL da foto (do upload)") String fotoUrl,
        @Schema(description = "Ordem de exibição") Integer ordem
) {}
