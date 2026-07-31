package br.org.fht.model;

import br.org.fht.common.Fuso;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Competicao organizada pela FHT (campeonato, copa, festival).
 *
 * O status NAO e armazenado: {@link #getStatusEfetivo()} deriva das datas e so e sobreposto
 * quando o admin seta um {@code statusOverride} — decisao registrada no §7 de
 * docs/MODULO-COMPETICOES.md (com varios admins, alguem sempre esquece de virar o status na mao).
 */
@Entity
@Table(name = "competicoes")
public class Competicao extends DefaultEntity {

    /** Derivados das datas — nunca sao gravados. */
    public static final String STATUS_EM_BREVE = "EM_BREVE";
    public static final String STATUS_EM_ANDAMENTO = "EM_ANDAMENTO";
    public static final String STATUS_ENCERRADO = "ENCERRADO";
    /** Exclusivos de override (as datas nao tem como saber). */
    public static final String STATUS_INSCRICOES_ABERTAS = "INSCRICOES_ABERTAS";
    public static final String STATUS_ADIADO = "ADIADO";
    public static final String STATUS_CANCELADO = "CANCELADO";

    public static final List<String> OVERRIDES_VALIDOS = List.of(
            STATUS_INSCRICOES_ABERTAS, STATUS_EM_ANDAMENTO, STATUS_ENCERRADO, STATUS_ADIADO, STATUS_CANCELADO);

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "competicao_categorias", joinColumns = @JoinColumn(name = "competicao_id"))
    @Column(name = "categoria", length = 30, nullable = false)
    private List<String> categorias = new ArrayList<>();

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Column(length = 255)
    private String local;

    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String uf = "TO";

    @Column(nullable = false)
    private Integer temporada;

    /** Informado a mao ate a Fatia 2, quando passa a ser count(participacoes). */
    @Column(name = "numero_equipes", nullable = false)
    private Integer numeroEquipes = 0;

    @Column(name = "link_inscricao", length = 500)
    private String linkInscricao;

    @Column(nullable = false, length = 20)
    private String cor = "#1A3A8F";

    @Column(name = "regulamento_url", length = 500)
    private String regulamentoUrl;

    /** Quando preenchido, vence a derivacao pelas datas. Nulo = status automatico. */
    @Column(name = "status_override", length = 30)
    private String statusOverride;

    @Column(name = "visivel_na_home", nullable = false)
    private boolean visivelNaHome = true;

    @Override
    protected void onCreate() {
        super.onCreate();
        if (temporada == null && dataInicio != null) temporada = dataInicio.getYear();
    }

    /**
     * Status mostrado ao usuario: o override manual vence; sem override, deriva das datas.
     * Calculado sempre na leitura, nunca persistido — e o que evita status desatualizado.
     * Usa o fuso do Tocantins: em UTC a virada do dia aconteceria as 21h de Palmas.
     */
    public String getStatusEfetivo() {
        return getStatusEfetivo(Fuso.hoje());
    }

    public String getStatusEfetivo(LocalDate hoje) {
        if (statusOverride != null && !statusOverride.isBlank()) {
            return statusOverride;
        }
        if (dataInicio == null || dataFim == null) {
            return STATUS_EM_BREVE;
        }
        if (hoje.isBefore(dataInicio)) return STATUS_EM_BREVE;
        if (hoje.isAfter(dataFim)) return STATUS_ENCERRADO;
        return STATUS_EM_ANDAMENTO;
    }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public List<String> getCategorias() { return categorias; }
    public void setCategorias(List<String> categorias) { this.categorias = categorias; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }

    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }

    public Integer getTemporada() { return temporada; }
    public void setTemporada(Integer temporada) { this.temporada = temporada; }

    public Integer getNumeroEquipes() { return numeroEquipes; }
    public void setNumeroEquipes(Integer numeroEquipes) { this.numeroEquipes = numeroEquipes; }

    public String getLinkInscricao() { return linkInscricao; }
    public void setLinkInscricao(String linkInscricao) { this.linkInscricao = linkInscricao; }

    public String getCor() { return cor; }
    public void setCor(String cor) { this.cor = cor; }

    public String getRegulamentoUrl() { return regulamentoUrl; }
    public void setRegulamentoUrl(String regulamentoUrl) { this.regulamentoUrl = regulamentoUrl; }

    public String getStatusOverride() { return statusOverride; }
    public void setStatusOverride(String statusOverride) { this.statusOverride = statusOverride; }

    public boolean isVisivelNaHome() { return visivelNaHome; }
    public void setVisivelNaHome(boolean visivelNaHome) { this.visivelNaHome = visivelNaHome; }
}
