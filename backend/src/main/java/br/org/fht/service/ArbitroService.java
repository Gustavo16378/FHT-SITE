package br.org.fht.service;

import br.org.fht.dto.arbitro.ArbitroForm;
import br.org.fht.dto.arbitro.ArbitroPublicoDTO;
import br.org.fht.dto.arbitro.ArbitroResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ArbitroService {

    /** Público: solicitação "quero ser árbitro". Cria com status PENDENTE. */
    ArbitroResponseDTO solicitar(ArbitroForm form);

    /** Admin: todos os árbitros. */
    List<ArbitroResponseDTO> listar();

    /** Público: só credenciados (vitrine da home). */
    List<ArbitroPublicoDTO> listarPublicos();

    void credenciar(UUID id, String nivel);

    void rejeitar(UUID id, String motivo);

    void suspender(UUID id);

    void reativar(UUID id);
}
