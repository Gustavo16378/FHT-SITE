package br.org.fht.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "atletas")
public class Atleta extends DefaultEntity {

    @Column(name = "clube_id", nullable = false)
    private UUID clubeId;

    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(nullable = false, length = 10)
    private String sexo;

    @Column(unique = true, nullable = false, length = 14)
    private String cpf;

    @Column(nullable = false, length = 30)
    private String rg;

    @Column(name = "rg_orgao_emissor", length = 50)
    private String rgOrgaoEmissor;

    @Column(name = "naturalidade_cidade", length = 100)
    private String naturalidadeCidade;

    @Column(name = "naturalidade_uf", length = 2)
    private String naturalidadeUf;

    @Column(length = 20)
    private String telefone;

    @Column(length = 255)
    private String email;

    @Column(length = 9)
    private String cep;

    @Column(length = 255)
    private String logradouro;

    @Column(length = 20)
    private String numero;

    @Column(length = 100)
    private String cidade;

    @Column(name = "uf_residencia", length = 2)
    private String ufResidencia;

    @Column(nullable = false, length = 50)
    private String posicao;

    @Column(nullable = false, length = 20)
    private String categoria;

    @Column(name = "is_transferencia", nullable = false)
    private boolean transferencia = false;

    @Column(name = "clube_anterior")
    private String clubeAnterior;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "rg_url")
    private String rgUrl;

    @Column(name = "comprovante_residencia_url")
    private String comprovanteResidenciaUrl;

    @Column(name = "comprovante_pagamento_url")
    private String comprovantePagamentoUrl;

    @Column(nullable = false, length = 50)
    private String status = "AGUARDANDO_PAGAMENTO";

    @Column(name = "motivo_rejeicao")
    private String motivoRejeicao;

    @Column(name = "taxa_valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaValor = new BigDecimal("35.00");

    @Column(name = "taxa_ano")
    private Integer taxaAno;

    @Override
    protected void onCreate() {
        super.onCreate();
        if (taxaAno == null) taxaAno = LocalDate.now().getYear();
    }

    public UUID getClubeId() { return clubeId; }
    public void setClubeId(UUID clubeId) { this.clubeId = clubeId; }

    public String getNomeCompleto() { return nomeCompleto; }
    public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }

    public String getRgOrgaoEmissor() { return rgOrgaoEmissor; }
    public void setRgOrgaoEmissor(String rgOrgaoEmissor) { this.rgOrgaoEmissor = rgOrgaoEmissor; }

    public String getNaturalidadeCidade() { return naturalidadeCidade; }
    public void setNaturalidadeCidade(String naturalidadeCidade) { this.naturalidadeCidade = naturalidadeCidade; }

    public String getNaturalidadeUf() { return naturalidadeUf; }
    public void setNaturalidadeUf(String naturalidadeUf) { this.naturalidadeUf = naturalidadeUf; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getUfResidencia() { return ufResidencia; }
    public void setUfResidencia(String ufResidencia) { this.ufResidencia = ufResidencia; }

    public String getPosicao() { return posicao; }
    public void setPosicao(String posicao) { this.posicao = posicao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public boolean isTransferencia() { return transferencia; }
    public void setTransferencia(boolean transferencia) { this.transferencia = transferencia; }

    public String getClubeAnterior() { return clubeAnterior; }
    public void setClubeAnterior(String clubeAnterior) { this.clubeAnterior = clubeAnterior; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public String getRgUrl() { return rgUrl; }
    public void setRgUrl(String rgUrl) { this.rgUrl = rgUrl; }

    public String getComprovanteResidenciaUrl() { return comprovanteResidenciaUrl; }
    public void setComprovanteResidenciaUrl(String comprovanteResidenciaUrl) { this.comprovanteResidenciaUrl = comprovanteResidenciaUrl; }

    public String getComprovantePagamentoUrl() { return comprovantePagamentoUrl; }
    public void setComprovantePagamentoUrl(String comprovantePagamentoUrl) { this.comprovantePagamentoUrl = comprovantePagamentoUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMotivoRejeicao() { return motivoRejeicao; }
    public void setMotivoRejeicao(String motivoRejeicao) { this.motivoRejeicao = motivoRejeicao; }

    public BigDecimal getTaxaValor() { return taxaValor; }
    public void setTaxaValor(BigDecimal taxaValor) { this.taxaValor = taxaValor; }

    public Integer getTaxaAno() { return taxaAno; }
    public void setTaxaAno(Integer taxaAno) { this.taxaAno = taxaAno; }
}
