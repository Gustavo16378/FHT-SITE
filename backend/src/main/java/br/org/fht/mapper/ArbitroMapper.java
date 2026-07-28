package br.org.fht.mapper;

import br.org.fht.dto.arbitro.ArbitroPublicoDTO;
import br.org.fht.dto.arbitro.ArbitroResponseDTO;
import br.org.fht.model.Arbitro;

public class ArbitroMapper {

    private ArbitroMapper() {}

    public static ArbitroResponseDTO toResponse(Arbitro a) {
        return new ArbitroResponseDTO(
                a.getId(),
                a.getNome(),
                a.getCpf(),
                a.getRg(),
                a.getOrgaoEmissor(),
                a.getDataNascimento(),
                a.getSexo(),
                a.getTelefone(),
                a.getEmail(),
                a.getCidade(),
                a.getUf(),
                a.getFotoUrl(),
                a.getRgUrl(),
                a.getComprovanteEscolarUrl(),
                a.isJaArbitro(),
                a.getNivelAtual(),
                a.getFederacaoOrigem(),
                a.isTemExperiencia(),
                a.getDescricaoExperiencia(),
                a.isDisponibilidadeFds(),
                a.getCursoInteresse(),
                a.getNivel(),
                a.getRegistro(),
                a.getInicioArbitragem(),
                a.getFormacao(),
                a.getStatus(),
                a.getMotivoRejeicao(),
                a.getCreatedAt()
        );
    }

    public static ArbitroPublicoDTO toPublico(Arbitro a) {
        return new ArbitroPublicoDTO(
                a.getId(),
                a.getNome(),
                a.getCidade(),
                a.getUf(),
                a.getNivel(),
                a.getFotoUrl()
        );
    }
}
