package br.org.fht.service;

import br.org.fht.dto.institucional.DiretorDTO;
import br.org.fht.dto.institucional.DiretorForm;
import br.org.fht.mapper.DiretorMapper;
import br.org.fht.model.Diretor;
import br.org.fht.repository.DiretorRepository;
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class DiretorServiceImpl implements DiretorService {

    @Inject DiretorRepository diretorRepository;
    @Inject R2StorageService r2;

    @Override
    public List<DiretorDTO> listar() {
        return diretorRepository.listOrdenados().stream().map(DiretorMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public DiretorDTO criar(DiretorForm form) {
        validar(form);
        Diretor d = new Diretor();
        aplicar(d, form);
        diretorRepository.persist(d);
        return DiretorMapper.toResponse(d);
    }

    @Override
    @Transactional
    public DiretorDTO atualizar(UUID id, DiretorForm form) {
        validar(form);
        Diretor d = diretorRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Diretor não encontrado", 404));
        aplicar(d, form);
        return DiretorMapper.toResponse(d);
    }

    @Override
    @Transactional
    public void deletar(UUID id) {
        if (!diretorRepository.deleteById(id)) {
            throw new WebApplicationException("Diretor não encontrado", 404);
        }
    }

    @Override
    public String uploadFoto(FileUpload file) {
        if (file == null || file.size() == 0) {
            throw new WebApplicationException("Arquivo ausente", 400);
        }
        String nome = file.fileName() != null ? file.fileName() : "foto";
        String key = "diretores/" + UUID.randomUUID() + "/" + nome;
        return r2.upload(key, file);
    }

    private void validar(DiretorForm form) {
        if (form == null) {
            throw new WebApplicationException("Corpo da requisição obrigatório", 400);
        }
        if (form.nome() == null || form.nome().isBlank()) {
            throw new WebApplicationException("O nome é obrigatório", 400);
        }
        if (form.cargo() == null || form.cargo().isBlank()) {
            throw new WebApplicationException("O cargo é obrigatório", 400);
        }
    }

    private void aplicar(Diretor d, DiretorForm form) {
        d.setNome(form.nome().trim());
        d.setCargo(form.cargo().trim());
        d.setArea(form.area());
        d.setMandato(form.mandato());
        d.setEmail(form.email());
        d.setTelefone(form.telefone());
        d.setDesde(form.desde());
        d.setBio(form.bio());
        d.setFotoUrl(form.fotoUrl());
        if (form.ordem() != null) d.setOrdem(form.ordem());
    }
}
