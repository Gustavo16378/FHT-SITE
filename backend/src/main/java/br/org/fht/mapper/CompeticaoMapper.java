package br.org.fht.mapper;

import br.org.fht.dto.competicao.CompeticaoPublicaDTO;
import br.org.fht.dto.competicao.CompeticaoResponseDTO;
import br.org.fht.model.Competicao;

import java.util.List;

public class CompeticaoMapper {

    private CompeticaoMapper() {}

    public static CompeticaoResponseDTO toResponse(Competicao c) {
        return new CompeticaoResponseDTO(
                c.getId(),
                c.getNome(),
                c.getDescricao(),
                List.copyOf(c.getCategorias()),
                c.getDataInicio(),
                c.getDataFim(),
                c.getLocal(),
                c.getCidade(),
                c.getUf(),
                c.getTemporada(),
                c.getNumeroEquipes(),
                c.getLinkInscricao(),
                c.getCor(),
                c.getRegulamentoUrl(),
                c.getStatusEfetivo(),
                c.getStatusOverride(),
                c.isVisivelNaHome(),
                c.getCreatedAt()
        );
    }

    public static CompeticaoPublicaDTO toPublica(Competicao c) {
        return new CompeticaoPublicaDTO(
                c.getId(),
                c.getNome(),
                c.getDescricao(),
                List.copyOf(c.getCategorias()),
                c.getDataInicio(),
                c.getDataFim(),
                c.getLocal(),
                c.getCidade(),
                c.getUf(),
                c.getTemporada(),
                c.getNumeroEquipes(),
                c.getLinkInscricao(),
                c.getCor(),
                c.getRegulamentoUrl(),
                c.getStatusEfetivo()
        );
    }
}
