package br.org.fht.service;

import br.org.fht.dto.institucional.DocumentoDTO;
import br.org.fht.dto.institucional.DocumentoForm;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;
import java.util.UUID;

public interface DocumentoService {

    /** Público: documentos ordenados; filtro de categoria opcional (null = todos). */
    List<DocumentoDTO> listar(String categoria);

    DocumentoDTO criar(DocumentoForm form, JsonWebToken jwt);

    DocumentoDTO atualizar(UUID id, DocumentoForm form);

    void deletar(UUID id);

    /** Sobe o PDF e devolve URL + tamanho. */
    UploadResult uploadArquivo(FileUpload file);

    record UploadResult(String url, long tamanhoBytes) {}
}
