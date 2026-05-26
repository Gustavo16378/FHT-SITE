package br.org.fht.service;

import br.org.fht.dto.clube.ClubeForm;
import br.org.fht.dto.clube.ClubeResponseDTO;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

public interface ClubeService {

    ClubeResponseDTO solicitar(ClubeForm form);

    List<ClubeResponseDTO> listar();

    ClubeResponseDTO buscarPorId(UUID id, JsonWebToken jwt);

    void aprovar(UUID id);

    void rejeitar(UUID id, String motivo);
}
