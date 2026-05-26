package br.org.fht.mapper;

import br.org.fht.dto.clube.ClubeResponseDTO;
import br.org.fht.model.Clube;

public class ClubeMapper {

    private ClubeMapper() {}

    public static ClubeResponseDTO toResponse(Clube c) {
        return new ClubeResponseDTO(
                c.getId(),
                c.getNome(),
                c.getCidade(),
                c.getUf(),
                c.getSigla(),
                c.getCnpj(),
                c.getRepresentanteNome(),
                c.getRepresentanteEmail(),
                c.getRepresentanteTelefone(),
                c.getAtaFundacaoUrl(),
                c.getEstatutoUrl(),
                c.getStatus(),
                c.getMotivoRejeicao(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
