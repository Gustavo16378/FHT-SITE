package br.org.fht.mapper;

import br.org.fht.dto.atleta.AtletaResponseDTO;
import br.org.fht.model.Atleta;

public class AtletaMapper {

    private AtletaMapper() {}

    public static AtletaResponseDTO toResponse(Atleta a) {
        return new AtletaResponseDTO(
                a.getId(),
                a.getClubeId(),
                a.getNomeCompleto(),
                a.getDataNascimento(),
                a.getSexo(),
                a.getCpf(),
                a.getRg(),
                a.getTelefone(),
                a.getEmail(),
                a.getCidade(),
                a.getUfResidencia(),
                a.getPosicao(),
                a.getCategoria(),
                a.isTransferencia(),
                a.getClubeAnterior(),
                a.getFotoUrl(),
                a.getRgUrl(),
                a.getComprovanteResidenciaUrl(),
                a.getComprovantePagamentoUrl(),
                a.getStatus(),
                a.getMotivoRejeicao(),
                a.getTaxaValor(),
                a.getTaxaAno(),
                a.getCreatedAt()
        );
    }
}
