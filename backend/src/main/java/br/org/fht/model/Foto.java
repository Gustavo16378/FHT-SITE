package br.org.fht.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fotos")
public class Foto extends DefaultEntity {

    @Column(name = "imagem_url", nullable = false, length = 500)
    private String imagemUrl;

    @Column(nullable = false)
    private String evento;

    @Column(length = 10)
    private String ano;

    private String categoria;

    // large | medium | small — posição/tamanho no mosaico da home.
    @Column(nullable = false, length = 10)
    private String tamanho = "medium";

    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }

    public String getEvento() { return evento; }
    public void setEvento(String evento) { this.evento = evento; }

    public String getAno() { return ano; }
    public void setAno(String ano) { this.ano = ano; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getTamanho() { return tamanho; }
    public void setTamanho(String tamanho) { this.tamanho = tamanho; }
}
