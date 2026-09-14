package br.org.fht.service;

import br.org.fht.dto.clube.ClubeForm;
import br.org.fht.dto.clube.ClubeResponseDTO;
import br.org.fht.dto.clube.ClubeUpdateForm;
import br.org.fht.dto.clube.ClubeVitrineDTO;
import br.org.fht.dto.clube.ClubeVitrineDetalheDTO;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

public interface ClubeService {

    ClubeResponseDTO solicitar(ClubeForm form);

    List<ClubeResponseDTO> listar();

    ClubeResponseDTO buscarPorId(UUID id, JsonWebToken jwt);

    ClubeResponseDTO atualizar(UUID id, ClubeUpdateForm form, JsonWebToken jwt);

    void aprovar(UUID id);

    void rejeitar(UUID id, String motivo);

    /** Desfaz a rejeição: o clube volta para PENDENTE e entra de novo na fila de análise. */
    void reconsiderar(UUID id);

    void suspender(UUID id);

    void reativar(UUID id);

    /** Vitrine pública: clubes ATIVOS e visíveis, só dados públicos. */
    List<ClubeVitrineDTO> listarPublicos();

    /** Detalhe público do clube (modal). 404 se não estiver ATIVO/visível. */
    ClubeVitrineDetalheDTO buscarPublico(UUID id);

    /** Liga/desliga o clube da vitrine da home (não altera status). */
    void definirVitrine(UUID id, boolean visivel);
}
