package br.org.fht.mapper;

import br.org.fht.dto.institucional.DocumentoDTO;
import br.org.fht.model.DocumentoInstitucional;

public class DocumentoMapper {

    private DocumentoMapper() {}

    public static DocumentoDTO toResponse(DocumentoInstitucional d) {
        return new DocumentoDTO(
                d.getId(),
                d.getTitulo(),
                d.getCategoria(),
                d.getArquivoUrl(),
                d.getDataPublicacao(),
                d.getPublicadoPor(),
                d.getTamanhoBytes(),
                d.getCreatedAt()
        );
    }
}
