package br.org.fht.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "arbitros")
public class Arbitro extends DefaultEntity {

    // ---- Dados pessoais ----
    @Column(nullable = false)
    private String nome;

    private String cpf;
    private String rg;

    @Column(name = "orgao_emissor")
    private String orgaoEmissor;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    private String sexo;
    private String telefone;
    private String email;
    private String cidade;

    @Column(length = 2)
    private String uf = "TO";

    // ---- Documentos ----
    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "rg_url")
    private String rgUrl;

    // ---- Credenciamento (preenchido pela comissão de arbitragem) ----
    // Nível oficial: Regional | Estadual B | Estadual A | Nacional
    private String nivel;
    private String registro;

    @Column(name = "inicio_arbitragem")
    private String inicioArbitragem;

    private String formacao;

    // ---- Status ----
    // CREDENCIADO | SUSPENSO — quem cadastra é a própria federação, então nasce credenciado.
    // PENDENTE e REJEITADO sobrevivem apenas nos registros que vieram do antigo formulário
    // público de solicitação, que não existe mais.
    @Column(nullable = false, length = 50)
    private String status = "CREDENCIADO";

    @Column(name = "motivo_rejeicao")
    private String motivoRejeicao;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }

    public String getOrgaoEmissor() { return orgaoEmissor; }
    public void setOrgaoEmissor(String orgaoEmissor) { this.orgaoEmissor = orgaoEmissor; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public String getRgUrl() { return rgUrl; }
    public void setRgUrl(String rgUrl) { this.rgUrl = rgUrl; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public String getRegistro() { return registro; }
    public void setRegistro(String registro) { this.registro = registro; }

    public String getInicioArbitragem() { return inicioArbitragem; }
    public void setInicioArbitragem(String inicioArbitragem) { this.inicioArbitragem = inicioArbitragem; }

    public String getFormacao() { return formacao; }
    public void setFormacao(String formacao) { this.formacao = formacao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMotivoRejeicao() { return motivoRejeicao; }
    public void setMotivoRejeicao(String motivoRejeicao) { this.motivoRejeicao = motivoRejeicao; }
}
