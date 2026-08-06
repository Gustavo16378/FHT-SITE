package br.org.fht.service;

import br.org.fht.common.OrigemRequisicao;
import br.org.fht.dto.atleta.AtletaDocumentosForm;
import br.org.fht.dto.atleta.AtletaForm;
import br.org.fht.dto.atleta.AtletaResponseDTO;
import br.org.fht.dto.atleta.AtletaUpdateForm;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

public interface AtletaService {

    AtletaResponseDTO cadastrar(AtletaForm form, JsonWebToken jwt, OrigemRequisicao origem);

    List<AtletaResponseDTO> listar(JsonWebToken jwt);

    AtletaResponseDTO buscarPorId(UUID id, JsonWebToken jwt);

    AtletaResponseDTO atualizar(UUID id, AtletaUpdateForm form, JsonWebToken jwt);

    AtletaResponseDTO anexarDocumentos(UUID id, AtletaDocumentosForm form, JsonWebToken jwt);

    /**
     * Ativa o atleta. O portão documental (RG e consentimento do menor) nunca é dispensado;
     * o financeiro sim, quando a federação confere o comprovante do lote e decide liberar.
     */
    void aprovar(UUID id, boolean dispensarPagamento, JsonWebToken jwt);

    void rejeitar(UUID id, String motivo);

    /** Desfaz a rejeição: o atleta volta para a fila (aguardando pagamento ou aprovação). */
    void reconsiderar(UUID id);

    void suspender(UUID id);

    void reativar(UUID id);

    void deletar(UUID id);
}
