package br.org.fht.model;

import jakarta.persistence.*;

@Entity
@Table(name = "diretores")
public class Diretor extends DefaultEntity {

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cargo;

    // Área de atuação (Gestão Geral, Competições, Financeiro, Arbitragem, Comunicação) — guia o ícone.
    private String area;

    private String mandato;

    private String email;

    private String telefone;

    // Texto livre (ex.: "Fevereiro/2023").
    private String desde;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(nullable = false)
    private int ordem = 0;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getMandato() { return mandato; }
    public void setMandato(String mandato) { this.mandato = mandato; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getDesde() { return desde; }
    public void setDesde(String desde) { this.desde = desde; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public int getOrdem() { return ordem; }
    public void setOrdem(int ordem) { this.ordem = ordem; }
}
