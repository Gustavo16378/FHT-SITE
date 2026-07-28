package br.org.fht.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "noticias")
public class Noticia extends DefaultEntity {

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(length = 500)
    private String resumo;

    @Column(columnDefinition = "TEXT")
    private String conteudo;

    @Column(name = "imagem_capa_url", length = 500)
    private String imagemCapaUrl;

    @Column(name = "autor_nome")
    private String autorNome;

    @Column(name = "data_publicacao", nullable = false)
    private LocalDate dataPublicacao;

    @Column(nullable = false)
    private boolean destaque = false;

    // RASCUNHO | PUBLICADO
    @Column(nullable = false, length = 20)
    private String status = "RASCUNHO";

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getResumo() { return resumo; }
    public void setResumo(String resumo) { this.resumo = resumo; }

    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }

    public String getImagemCapaUrl() { return imagemCapaUrl; }
    public void setImagemCapaUrl(String imagemCapaUrl) { this.imagemCapaUrl = imagemCapaUrl; }

    public String getAutorNome() { return autorNome; }
    public void setAutorNome(String autorNome) { this.autorNome = autorNome; }

    public LocalDate getDataPublicacao() { return dataPublicacao; }
    public void setDataPublicacao(LocalDate dataPublicacao) { this.dataPublicacao = dataPublicacao; }

    public boolean isDestaque() { return destaque; }
    public void setDestaque(boolean destaque) { this.destaque = destaque; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
