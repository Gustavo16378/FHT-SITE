package br.org.fht.mapper;

import br.org.fht.common.Fuso;
import br.org.fht.dto.atleta.AtletaResponseDTO;
import br.org.fht.dto.atleta.ConsentimentoDTO;
import br.org.fht.model.Atleta;
import br.org.fht.model.Consentimento;

import java.util.List;

public class AtletaMapper {

    private AtletaMapper() {}

    public static AtletaResponseDTO toResponse(Atleta a) {
        return toResponse(a, List.of());
    }

    public static AtletaResponseDTO toResponse(Atleta a, List<Consentimento> consentimentos) {
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
                a.isMenorDeIdade(Fuso.hoje()),
                a.getResponsavelNome(),
                a.getResponsavelCpf(),
                a.getResponsavelParentesco(),
                a.getResponsavelEmail(),
                a.getResponsavelTelefone(),
                a.getFotoUrl(),
                a.getRgUrl(),
                a.getComprovanteResidenciaUrl(),
                a.getComprovantePagamentoUrl(),
                a.getStatus(),
                a.getMotivoRejeicao(),
                a.getPrazoPagamentoAte(),
                a.getTaxaValor(),
                a.getTaxaAno(),
                consentimentos.stream().map(AtletaMapper::toConsentimento).toList(),
                a.getCreatedAt()
        );
    }

    public static ConsentimentoDTO toConsentimento(Consentimento c) {
        return new ConsentimentoDTO(
                c.getId(),
                c.getFinalidade(),
                c.isTitularMenor(),
                c.getConsentidoPorNome(),
                c.getConsentidoPorCpf(),
                c.getTextoVersao(),
                c.getConcedidoEm(),
                c.getRevogadoEm()
        );
    }
}
