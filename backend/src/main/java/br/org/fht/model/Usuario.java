package br.org.fht.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "usuarios")
public class Usuario extends DefaultEntity {

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "clube_id")
    private UUID clubeId;

    @Column(nullable = false)
    private boolean ativo = true;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }

    /**
     * O e-mail é o identificador de login e a coluna é UNIQUE — então normaliza aqui, no único
     * ponto por onde todo mundo passa. Antes, o cadastro normalizava e o login não: quem se
     * cadastrava pelo celular (teclado capitaliza a primeira letra sozinho) digitava exatamente
     * o mesmo texto depois e tomava 401 de credencial inválida.
     */
    public void setEmail(String email) {
        this.email = email == null ? null : email.trim().toLowerCase();
    }

    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public UUID getClubeId() { return clubeId; }
    public void setClubeId(UUID clubeId) { this.clubeId = clubeId; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
