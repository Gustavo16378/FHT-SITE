package br.org.fht.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Registro de consentimento LGPD — um por FINALIDADE (art. 14, §1: "específico e em destaque").
 * Guarda a evidência de quem consentiu, quando e de onde, para atender o princípio da
 * responsabilização/prestação de contas (art. 6, X). Ver docs/LGPD-CONFORMIDADE.md §2.
 */
@Entity
@Table(name = "consentimentos")
public class Consentimento extends DefaultEntity {

    /** Anuência do responsável legal para a filiação do atleta menor. Obrigatório se menor. */
    public static final String FINALIDADE_CADASTRO_MENOR = "CADASTRO_ATLETA_MENOR";
    /** Autorização de uso de imagem/nome no site, na galeria e em notícias. Sempre opcional. */
    public static final String FINALIDADE_IMAGEM_PUBLICA = "IMAGEM_PUBLICA";

    /** Versão do texto do termo aceito — muda quando o texto do termo mudar. */
    public static final String TEXTO_VERSAO_ATUAL = "1.0";

    @Column(name = "atleta_id", nullable = false)
    private UUID atletaId;

    @Column(nullable = false, length = 50)
    private String finalidade;

    @Column(name = "titular_menor", nullable = false)
    private boolean titularMenor = false;

    @Column(name = "consentido_por_nome")
    private String consentidoPorNome;

    @Column(name = "consentido_por_cpf", length = 14)
    private String consentidoPorCpf;

    @Column(name = "texto_versao", nullable = false, length = 20)
    private String textoVersao = TEXTO_VERSAO_ATUAL;

    @Column(name = "concedido_em", nullable = false)
    private LocalDateTime concedidoEm;

    @Column(name = "ip_origem", length = 64)
    private String ipOrigem;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "revogado_em")
    private LocalDateTime revogadoEm;

    @Override
    protected void onCreate() {
        super.onCreate();
        if (concedidoEm == null) concedidoEm = LocalDateTime.now();
    }

    public UUID getAtletaId() { return atletaId; }
    public void setAtletaId(UUID atletaId) { this.atletaId = atletaId; }

    public String getFinalidade() { return finalidade; }
    public void setFinalidade(String finalidade) { this.finalidade = finalidade; }

    public boolean isTitularMenor() { return titularMenor; }
    public void setTitularMenor(boolean titularMenor) { this.titularMenor = titularMenor; }

    public String getConsentidoPorNome() { return consentidoPorNome; }
    public void setConsentidoPorNome(String consentidoPorNome) { this.consentidoPorNome = consentidoPorNome; }

    public String getConsentidoPorCpf() { return consentidoPorCpf; }
    public void setConsentidoPorCpf(String consentidoPorCpf) { this.consentidoPorCpf = consentidoPorCpf; }

    public String getTextoVersao() { return textoVersao; }
    public void setTextoVersao(String textoVersao) { this.textoVersao = textoVersao; }

    public LocalDateTime getConcedidoEm() { return concedidoEm; }
    public void setConcedidoEm(LocalDateTime concedidoEm) { this.concedidoEm = concedidoEm; }

    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public LocalDateTime getRevogadoEm() { return revogadoEm; }
    public void setRevogadoEm(LocalDateTime revogadoEm) { this.revogadoEm = revogadoEm; }
}
