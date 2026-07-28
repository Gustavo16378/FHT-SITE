package br.org.fht.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "documentos")
public class DocumentoInstitucional extends DefaultEntity {

    @Column(nullable = false)
    private String titulo;

    // Estatuto | Regulamento | Calendário | Edital | Circular
    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(name = "arquivo_url", nullable = false, length = 500)
    private String arquivoUrl;

    @Column(name = "data_publicacao", nullable = false)
    private LocalDate dataPublicacao;

    @Column(name = "publicado_por")
    private String publicadoPor;

    // Tamanho do arquivo em bytes (para exibir "1,8 MB" no site).
    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getArquivoUrl() { return arquivoUrl; }
    public void setArquivoUrl(String arquivoUrl) { this.arquivoUrl = arquivoUrl; }

    public LocalDate getDataPublicacao() { return dataPublicacao; }
    public void setDataPublicacao(LocalDate dataPublicacao) { this.dataPublicacao = dataPublicacao; }

    public String getPublicadoPor() { return publicadoPor; }
    public void setPublicadoPor(String publicadoPor) { this.publicadoPor = publicadoPor; }

    public Long getTamanhoBytes() { return tamanhoBytes; }
    public void setTamanhoBytes(Long tamanhoBytes) { this.tamanhoBytes = tamanhoBytes; }
}
