package br.org.fht.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Pagamento da anuidade feito pelo clube cobrindo VARIOS atletas de uma vez.
 *
 * O clube junta os atletas pendentes, faz um Pix so, anexa um comprovante e envia. A federacao
 * confere na mao e da baixa — nao ha integracao com banco nem gateway. Ver docs/MODULO-ATLETA-FLUXO.md.
 */
@Entity
@Table(name = "pagamento_lotes")
public class PagamentoLote extends DefaultEntity {

    public static final String STATUS_AGUARDANDO_BAIXA = "AGUARDANDO_BAIXA";
    public static final String STATUS_CONFIRMADO = "CONFIRMADO";
    public static final String STATUS_REJEITADO = "REJEITADO";

    @Column(name = "clube_id", nullable = false)
    private UUID clubeId;

    /** Código curto para o clube citar ao falar com a federação. */
    @Column(nullable = false, length = 30, unique = true)
    private String protocolo;

    @Column(nullable = false)
    private Integer ano;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "quantidade_atletas", nullable = false)
    private Integer quantidadeAtletas;

    @Column(name = "comprovante_url", length = 500)
    private String comprovanteUrl;

    @Column(nullable = false, length = 30)
    private String status = STATUS_AGUARDANDO_BAIXA;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "motivo_rejeicao", columnDefinition = "TEXT")
    private String motivoRejeicao;

    @Column(name = "enviado_em", nullable = false)
    private LocalDateTime enviadoEm;

    @Column(name = "baixado_em")
    private LocalDateTime baixadoEm;

    @Column(name = "baixado_por")
    private String baixadoPor;

    @Override
    protected void onCreate() {
        super.onCreate();
        if (enviadoEm == null) enviadoEm = LocalDateTime.now();
    }

    public UUID getClubeId() { return clubeId; }
    public void setClubeId(UUID clubeId) { this.clubeId = clubeId; }

    public String getProtocolo() { return protocolo; }
    public void setProtocolo(String protocolo) { this.protocolo = protocolo; }

    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public Integer getQuantidadeAtletas() { return quantidadeAtletas; }
    public void setQuantidadeAtletas(Integer quantidadeAtletas) { this.quantidadeAtletas = quantidadeAtletas; }

    public String getComprovanteUrl() { return comprovanteUrl; }
    public void setComprovanteUrl(String comprovanteUrl) { this.comprovanteUrl = comprovanteUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }

    public String getMotivoRejeicao() { return motivoRejeicao; }
    public void setMotivoRejeicao(String motivoRejeicao) { this.motivoRejeicao = motivoRejeicao; }

    public LocalDateTime getEnviadoEm() { return enviadoEm; }
    public void setEnviadoEm(LocalDateTime enviadoEm) { this.enviadoEm = enviadoEm; }

    public LocalDateTime getBaixadoEm() { return baixadoEm; }
    public void setBaixadoEm(LocalDateTime baixadoEm) { this.baixadoEm = baixadoEm; }

    public String getBaixadoPor() { return baixadoPor; }
    public void setBaixadoPor(String baixadoPor) { this.baixadoPor = baixadoPor; }
}
