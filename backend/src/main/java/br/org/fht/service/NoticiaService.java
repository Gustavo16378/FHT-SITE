package br.org.fht.service;

import br.org.fht.dto.noticia.NoticiaForm;
import br.org.fht.dto.noticia.NoticiaResponseDTO;
import br.org.fht.dto.noticia.NoticiaResumoDTO;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;
import java.util.UUID;

public interface NoticiaService {

    /** Público: só notícias PUBLICADAS. Filtro de categoria opcional (null = todas). */
    List<NoticiaResumoDTO> listarPublicas(String categoria);

    /** Público: uma notícia PUBLICADA pelo slug. */
    NoticiaResponseDTO buscarPorSlug(String slug);

    /** Admin: todas as notícias (inclui rascunhos), com corpo completo para o editor. */
    List<NoticiaResponseDTO> listarTodas();

    NoticiaResponseDTO criar(NoticiaForm form, JsonWebToken jwt);

    NoticiaResponseDTO atualizar(UUID id, NoticiaForm form);

    void deletar(UUID id);

    /** Sobe uma imagem (capa/corpo) e devolve a URL para salvar na notícia. */
    String uploadImagem(FileUpload file);
}
