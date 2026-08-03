package br.org.fht.model;

import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

/**
 * Pessoa ligada ao clube: representantes (sao dois) e o tecnico, que e quem define
 * quem vai jogar. Ver docs/MODULO-CLUBES-VITRINE.md.
 *
 * ⚠️ Nesta etapa e apenas DADO CADASTRAL — ninguem aqui tem login proprio. So o representante
 * principal tem conta (o Usuario criado no cadastro do clube). Dar login por pessoa exige o
 * modulo de permissoes, que ainda nao existe.
 */
@Entity
@Table(name = "clube_pessoas")
public class ClubePessoa extends DefaultEntity {

    public static final String FUNCAO_REPRESENTANTE = "REPRESENTANTE";
    public static final String FUNCAO_TECNICO = "TECNICO";
    public static final String FUNCAO_AUXILIAR = "AUXILIAR";

    public static final List<String> FUNCOES_VALIDAS =
            List.of(FUNCAO_REPRESENTANTE, FUNCAO_TECNICO, FUNCAO_AUXILIAR);

    @Column(name = "clube_id", nullable = false)
    private UUID clubeId;

    @Column(nullable = false)
    private String nome;

    @Column(length = 14)
    private String cpf;

    @Column(nullable = false, length = 30)
    private String funcao;

    @Column(length = 60)
    private String cargo;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String telefone;

    /** O representante que responde oficialmente pelo clube — é o dono do login. */
    @Column(nullable = false)
    private boolean principal = false;

    public UUID getClubeId() { return clubeId; }
    public void setClubeId(UUID clubeId) { this.clubeId = clubeId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getFuncao() { return funcao; }
    public void setFuncao(String funcao) { this.funcao = funcao; }

    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public boolean isPrincipal() { return principal; }
    public void setPrincipal(boolean principal) { this.principal = principal; }
}
