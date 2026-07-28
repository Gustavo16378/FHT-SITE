package br.org.fht.dto.arbitro;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.UUID;

/**
 * Árbitro na vitrine pública — só dados públicos (nome, cidade, nível, foto).
 * Nada de CPF/RG/documentos/contato.
 */
@Schema(description = "Árbitro credenciado exibido no site")
public record ArbitroPublicoDTO(
        UUID id,
        String nome,
        String cidade,
        String uf,
        String nivel,
        String fotoUrl
) {}
