package br.org.fht.service;

import br.org.fht.common.SlugGenerator;
import br.org.fht.dto.noticia.NoticiaForm;
import br.org.fht.dto.noticia.NoticiaResponseDTO;
import br.org.fht.dto.noticia.NoticiaResumoDTO;
import br.org.fht.mapper.NoticiaMapper;
import br.org.fht.model.Noticia;
import br.org.fht.repository.NoticiaRepository;
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class NoticiaServiceImpl implements NoticiaService {

    private static final Set<String> CATEGORIAS = Set.of("Institucional", "Competição", "Arbitragem", "Seleção");
    private static final Set<String> STATUS = Set.of("RASCUNHO", "PUBLICADO");

    @Inject NoticiaRepository noticiaRepository;
    @Inject R2StorageService r2;

    @Override
    public List<NoticiaResumoDTO> listarPublicas(String categoria) {
        List<Noticia> noticias = (categoria == null || categoria.isBlank())
                ? noticiaRepository.listPublicadas()
                : noticiaRepository.listPublicadasPorCategoria(categoria);
        return noticias.stream().map(NoticiaMapper::toResumo).toList();
    }

    @Override
    public NoticiaResponseDTO buscarPorSlug(String slug) {
        Noticia noticia = noticiaRepository.findBySlug(slug)
                .filter(n -> "PUBLICADO".equals(n.getStatus()))
                .orElseThrow(() -> new WebApplicationException("Notícia não encontrada", 404));
        return NoticiaMapper.toResponse(noticia);
    }

    @Override
    public List<NoticiaResponseDTO> listarTodas() {
        return noticiaRepository.listTodas().stream().map(NoticiaMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public NoticiaResponseDTO criar(NoticiaForm form, JsonWebToken jwt) {
        validar(form);

        Noticia n = new Noticia();
        aplicar(n, form);
        n.setSlug(gerarSlugUnico(form.titulo(), null));
        n.setAutorNome(nomeAutor(jwt));

        noticiaRepository.persist(n);
        return NoticiaMapper.toResponse(n);
    }

    @Override
    @Transactional
    public NoticiaResponseDTO atualizar(UUID id, NoticiaForm form) {
        validar(form);

        Noticia n = noticiaRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Notícia não encontrada", 404));

        // Só regera o slug se o título mudou — assim os links já publicados continuam válidos.
        boolean tituloMudou = form.titulo() != null && !form.titulo().equals(n.getTitulo());

        aplicar(n, form);
        if (tituloMudou) {
            n.setSlug(gerarSlugUnico(form.titulo(), id));
        }

        return NoticiaMapper.toResponse(n);
    }

    @Override
    @Transactional
    public void deletar(UUID id) {
        boolean removido = noticiaRepository.deleteById(id);
        if (!removido) {
            throw new WebApplicationException("Notícia não encontrada", 404);
        }
    }

    @Override
    public String uploadImagem(FileUpload file) {
        if (file == null || file.size() == 0) {
            throw new WebApplicationException("Arquivo de imagem ausente", 400);
        }
        String nome = file.fileName() != null ? file.fileName() : "imagem";
        String key = "noticias/" + UUID.randomUUID() + "/" + nome;
        return r2.upload(key, file);
    }

    // --------------------- helpers ---------------------

    private void validar(NoticiaForm form) {
        if (form.titulo() == null || form.titulo().isBlank()) {
            throw new WebApplicationException("Título é obrigatório", 400);
        }
        if (form.categoria() == null || !CATEGORIAS.contains(form.categoria())) {
            throw new WebApplicationException("Categoria inválida", 400);
        }
        if (form.status() != null && !STATUS.contains(form.status())) {
            throw new WebApplicationException("Status inválido", 400);
        }
    }

    /** Copia os campos do form para a entidade, aplicando defaults. */
    private void aplicar(Noticia n, NoticiaForm form) {
        n.setTitulo(form.titulo().trim());
        n.setCategoria(form.categoria());
        n.setResumo(form.resumo());
        n.setConteudo(form.conteudo());
        n.setImagemCapaUrl(form.imagemCapaUrl());
        n.setDataPublicacao(form.dataPublicacao() != null ? form.dataPublicacao() : LocalDate.now());
        n.setDestaque(Boolean.TRUE.equals(form.destaque()));
        n.setStatus(form.status() != null ? form.status() : "RASCUNHO");
    }

    /** Gera um slug único a partir do título, ignorando a própria notícia (na edição). */
    private String gerarSlugUnico(String titulo, UUID idAtual) {
        String base = SlugGenerator.slugify(titulo);
        String slug = base;
        int i = 2;
        while (true) {
            Optional<Noticia> existente = noticiaRepository.findBySlug(slug);
            boolean livre = existente.isEmpty()
                    || (idAtual != null && existente.get().getId().equals(idAtual));
            if (livre) {
                return slug;
            }
            slug = base + "-" + i++;
        }
    }

    private String nomeAutor(JsonWebToken jwt) {
        if (jwt == null) {
            return null;
        }
        String nome = jwt.getClaim("name");
        if (nome == null || nome.isBlank()) {
            nome = jwt.getName();
        }
        return nome;
    }
}
