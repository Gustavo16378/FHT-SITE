package br.org.fht.mapper;

import br.org.fht.dto.noticia.NoticiaResponseDTO;
import br.org.fht.dto.noticia.NoticiaResumoDTO;
import br.org.fht.model.Noticia;

public class NoticiaMapper {

    private NoticiaMapper() {}

    public static NoticiaResumoDTO toResumo(Noticia n) {
        return new NoticiaResumoDTO(
                n.getId(),
                n.getTitulo(),
                n.getSlug(),
                n.getCategoria(),
                n.getResumo(),
                n.getImagemCapaUrl(),
                n.getAutorNome(),
                n.getDataPublicacao(),
                n.isDestaque(),
                n.getStatus(),
                n.getCreatedAt(),
                n.getUpdatedAt()
        );
    }

    public static NoticiaResponseDTO toResponse(Noticia n) {
        return new NoticiaResponseDTO(
                n.getId(),
                n.getTitulo(),
                n.getSlug(),
                n.getCategoria(),
                n.getResumo(),
                n.getConteudo(),
                n.getImagemCapaUrl(),
                n.getAutorNome(),
                n.getDataPublicacao(),
                n.isDestaque(),
                n.getStatus(),
                n.getCreatedAt(),
                n.getUpdatedAt()
        );
    }
}
