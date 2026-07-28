package br.org.fht.mapper;

import br.org.fht.dto.galeria.FotoDTO;
import br.org.fht.model.Foto;

public class FotoMapper {

    private FotoMapper() {}

    public static FotoDTO toResponse(Foto f) {
        return new FotoDTO(
                f.getId(),
                f.getImagemUrl(),
                f.getEvento(),
                f.getAno(),
                f.getCategoria(),
                f.getTamanho(),
                f.getCreatedAt()
        );
    }
}
