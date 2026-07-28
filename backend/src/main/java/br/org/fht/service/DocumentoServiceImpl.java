package br.org.fht.service;

import br.org.fht.dto.institucional.DocumentoDTO;
import br.org.fht.dto.institucional.DocumentoForm;
import br.org.fht.mapper.DocumentoMapper;
import br.org.fht.model.DocumentoInstitucional;
import br.org.fht.repository.DocumentoRepository;
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class DocumentoServiceImpl implements DocumentoService {

    private static final Set<String> CATEGORIAS =
            Set.of("Estatuto", "Regulamento", "Calendário", "Edital", "Circular");

    @Inject DocumentoRepository documentoRepository;
    @Inject R2StorageService r2;

    @Override
    public List<DocumentoDTO> listar(String categoria) {
        List<DocumentoInstitucional> docs = (categoria == null || categoria.isBlank())
                ? documentoRepository.listOrdenados()
                : documentoRepository.listPorCategoria(categoria);
        return docs.stream().map(DocumentoMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public DocumentoDTO criar(DocumentoForm form, JsonWebToken jwt) {
        validar(form);
        DocumentoInstitucional d = new DocumentoInstitucional();
        aplicar(d, form);
        d.setPublicadoPor(nomeAutor(jwt));
        documentoRepository.persist(d);
        return DocumentoMapper.toResponse(d);
    }

    @Override
    @Transactional
    public DocumentoDTO atualizar(UUID id, DocumentoForm form) {
        validar(form);
        DocumentoInstitucional d = documentoRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Documento não encontrado", 404));
        aplicar(d, form);
        return DocumentoMapper.toResponse(d);
    }

    @Override
    @Transactional
    public void deletar(UUID id) {
        if (!documentoRepository.deleteById(id)) {
            throw new WebApplicationException("Documento não encontrado", 404);
        }
    }

    @Override
    public UploadResult uploadArquivo(FileUpload file) {
        if (file == null || file.size() == 0) {
            throw new WebApplicationException("Arquivo ausente", 400);
        }
        String nome = file.fileName() != null ? file.fileName() : "documento.pdf";
        String key = "documentos/" + UUID.randomUUID() + "/" + nome;
        String url = r2.upload(key, file);
        return new UploadResult(url, file.size());
    }

    private void validar(DocumentoForm form) {
        if (form.titulo() == null || form.titulo().isBlank()) {
            throw new WebApplicationException("O título é obrigatório", 400);
        }
        if (form.categoria() == null || !CATEGORIAS.contains(form.categoria())) {
            throw new WebApplicationException("Categoria inválida", 400);
        }
        if (form.arquivoUrl() == null || form.arquivoUrl().isBlank()) {
            throw new WebApplicationException("O arquivo é obrigatório", 400);
        }
    }

    private void aplicar(DocumentoInstitucional d, DocumentoForm form) {
        d.setTitulo(form.titulo().trim());
        d.setCategoria(form.categoria());
        d.setArquivoUrl(form.arquivoUrl().trim());
        d.setDataPublicacao(form.dataPublicacao() != null ? form.dataPublicacao() : LocalDate.now());
        d.setTamanhoBytes(form.tamanhoBytes());
    }

    private String nomeAutor(JsonWebToken jwt) {
        if (jwt == null) return null;
        String nome = jwt.getClaim("name");
        if (nome == null || nome.isBlank()) nome = jwt.getName();
        return nome;
    }
}
