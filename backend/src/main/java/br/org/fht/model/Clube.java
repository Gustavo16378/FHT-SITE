package br.org.fht.model;

import jakarta.persistence.*;

@Entity
@Table(name = "clubes")
public class Clube extends DefaultEntity {

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cidade;

    @Column(nullable = false, length = 2)
    private String uf = "TO";

    private String sigla;

    private String cnpj;

    @Column(name = "representante_nome", nullable = false)
    private String representanteNome;

    @Column(name = "representante_email", nullable = false)
    private String representanteEmail;

    @Column(name = "representante_telefone", nullable = false)
    private String representanteTelefone;

    @Column(name = "representante_cargo")
    private String representanteCargo;

    @Column(name = "ata_fundacao_url")
    private String ataFundacaoUrl;

    @Column(name = "estatuto_url")
    private String estatutoUrl;

    @Column(nullable = false, length = 50)
    private String status = "PENDENTE";

    @Column(name = "motivo_rejeicao")
    private String motivoRejeicao;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }

    public String getSigla() { return sigla; }
    public void setSigla(String sigla) { this.sigla = sigla; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getRepresentanteNome() { return representanteNome; }
    public void setRepresentanteNome(String representanteNome) { this.representanteNome = representanteNome; }

    public String getRepresentanteEmail() { return representanteEmail; }
    public void setRepresentanteEmail(String representanteEmail) { this.representanteEmail = representanteEmail; }

    public String getRepresentanteTelefone() { return representanteTelefone; }
    public void setRepresentanteTelefone(String representanteTelefone) { this.representanteTelefone = representanteTelefone; }

    public String getRepresentanteCargo() { return representanteCargo; }
    public void setRepresentanteCargo(String representanteCargo) { this.representanteCargo = representanteCargo; }

    public String getAtaFundacaoUrl() { return ataFundacaoUrl; }
    public void setAtaFundacaoUrl(String ataFundacaoUrl) { this.ataFundacaoUrl = ataFundacaoUrl; }

    public String getEstatutoUrl() { return estatutoUrl; }
    public void setEstatutoUrl(String estatutoUrl) { this.estatutoUrl = estatutoUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMotivoRejeicao() { return motivoRejeicao; }
    public void setMotivoRejeicao(String motivoRejeicao) { this.motivoRejeicao = motivoRejeicao; }
}
