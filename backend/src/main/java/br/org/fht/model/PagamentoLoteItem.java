package br.org.fht.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Um atleta coberto por um lote de pagamento.
 *
 * Guarda SNAPSHOT do nome e do valor porque a linha e prova de pagamento: precisa continuar
 * legivel mesmo depois que o atleta for removido (a FK e ON DELETE SET NULL, nao CASCADE).
 */
@Entity
@Table(name = "pagamento_lote_itens")
public class PagamentoLoteItem extends DefaultEntity {

    @Column(name = "lote_id", nullable = false)
    private UUID loteId;

    /** Nulo quando o atleta foi removido depois — o nome no snapshot preserva a informação. */
    @Column(name = "atleta_id")
    private UUID atletaId;

    @Column(name = "atleta_nome", nullable = false)
    private String atletaNome;

    @Column(nullable = false)
    private Integer ano;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    /**
     * Vira false quando o lote é rejeitado, devolvendo o atleta para a fila de pendentes.
     * É o que o índice único (atleta_id, ano) WHERE ativo usa para impedir cobrança dupla.
     */
    @Column(nullable = false)
    private boolean ativo = true;

    public UUID getLoteId() { return loteId; }
    public void setLoteId(UUID loteId) { this.loteId = loteId; }

    public UUID getAtletaId() { return atletaId; }
    public void setAtletaId(UUID atletaId) { this.atletaId = atletaId; }

    public String getAtletaNome() { return atletaNome; }
    public void setAtletaNome(String atletaNome) { this.atletaNome = atletaNome; }

    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
