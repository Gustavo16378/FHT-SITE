package br.org.fht.service;

import br.org.fht.dto.galeria.FotoDTO;
import br.org.fht.dto.galeria.FotoForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;
import java.util.UUID;

public interface GaleriaService {

    /** Público: todas as fotos da galeria, ordenadas. */
    List<FotoDTO> listar();

    FotoDTO criar(FotoForm form);

    FotoDTO atualizar(UUID id, FotoForm form);

    void deletar(UUID id);

    /** Sobe a imagem e devolve a URL para salvar na foto. */
    String uploadImagem(FileUpload file);
}
