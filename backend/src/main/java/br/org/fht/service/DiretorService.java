package br.org.fht.service;

import br.org.fht.dto.institucional.DiretorDTO;
import br.org.fht.dto.institucional.DiretorForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;
import java.util.UUID;

public interface DiretorService {

    /** Público: diretoria ordenada. */
    List<DiretorDTO> listar();

    DiretorDTO criar(DiretorForm form);

    DiretorDTO atualizar(UUID id, DiretorForm form);

    void deletar(UUID id);

    String uploadFoto(FileUpload file);
}
