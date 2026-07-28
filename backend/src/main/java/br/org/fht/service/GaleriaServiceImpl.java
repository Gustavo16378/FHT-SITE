package br.org.fht.service;

import br.org.fht.dto.galeria.FotoDTO;
import br.org.fht.dto.galeria.FotoForm;
import br.org.fht.mapper.FotoMapper;
import br.org.fht.model.Foto;
import br.org.fht.repository.FotoRepository;
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class GaleriaServiceImpl implements GaleriaService {

    private static final Set<String> TAMANHOS = Set.of("large", "medium", "small");

    @Inject FotoRepository fotoRepository;
    @Inject R2StorageService r2;

    @Override
    public List<FotoDTO> listar() {
        return fotoRepository.listOrdenadas().stream().map(FotoMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public FotoDTO criar(FotoForm form) {
        validar(form);
        Foto foto = new Foto();
        aplicar(foto, form);
        fotoRepository.persist(foto);
        return FotoMapper.toResponse(foto);
    }

    @Override
    @Transactional
    public FotoDTO atualizar(UUID id, FotoForm form) {
        validar(form);
        Foto foto = fotoRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Foto não encontrada", 404));
        aplicar(foto, form);
        return FotoMapper.toResponse(foto);
    }

    @Override
    @Transactional
    public void deletar(UUID id) {
        if (!fotoRepository.deleteById(id)) {
            throw new WebApplicationException("Foto não encontrada", 404);
        }
    }

    @Override
    public String uploadImagem(FileUpload file) {
        if (file == null || file.size() == 0) {
            throw new WebApplicationException("Arquivo de imagem ausente", 400);
        }
        String nome = file.fileName() != null ? file.fileName() : "foto";
        String key = "galeria/" + UUID.randomUUID() + "/" + nome;
        return r2.upload(key, file);
    }

    // --------------------- helpers ---------------------

    private void validar(FotoForm form) {
        if (form.imagemUrl() == null || form.imagemUrl().isBlank()) {
            throw new WebApplicationException("A imagem é obrigatória", 400);
        }
        if (form.evento() == null || form.evento().isBlank()) {
            throw new WebApplicationException("O evento/legenda é obrigatório", 400);
        }
        if (form.tamanho() != null && !TAMANHOS.contains(form.tamanho())) {
            throw new WebApplicationException("Tamanho inválido", 400);
        }
    }

    private void aplicar(Foto foto, FotoForm form) {
        foto.setImagemUrl(form.imagemUrl().trim());
        foto.setEvento(form.evento().trim());
        foto.setAno(form.ano());
        foto.setCategoria(form.categoria());
        foto.setTamanho(form.tamanho() != null ? form.tamanho() : "medium");
    }
}
