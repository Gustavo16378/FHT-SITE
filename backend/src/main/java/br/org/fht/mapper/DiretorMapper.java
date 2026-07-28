package br.org.fht.mapper;

import br.org.fht.dto.institucional.DiretorDTO;
import br.org.fht.model.Diretor;

public class DiretorMapper {

    private DiretorMapper() {}

    public static DiretorDTO toResponse(Diretor d) {
        return new DiretorDTO(
                d.getId(),
                d.getNome(),
                d.getCargo(),
                d.getArea(),
                d.getMandato(),
                d.getEmail(),
                d.getTelefone(),
                d.getDesde(),
                d.getBio(),
                d.getFotoUrl(),
                d.getOrdem(),
                d.getCreatedAt()
        );
    }
}
