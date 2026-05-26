package br.org.fht.service;

import br.org.fht.dto.atleta.AtletaForm;
import br.org.fht.dto.atleta.AtletaResponseDTO;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

public interface AtletaService {

    AtletaResponseDTO cadastrar(AtletaForm form, JsonWebToken jwt);

    List<AtletaResponseDTO> listar(JsonWebToken jwt);

    AtletaResponseDTO buscarPorId(UUID id, JsonWebToken jwt);

    void aprovar(UUID id);

    void rejeitar(UUID id, String motivo);

    void deletar(UUID id);
}
