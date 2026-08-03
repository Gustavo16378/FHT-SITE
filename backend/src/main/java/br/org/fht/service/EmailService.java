package br.org.fht.service;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.util.List;

/**
 * Avisos por e-mail da federacao.
 *
 * ⚠️ Em desenvolvimento o envio e SIMULADO (quarkus.mailer.mock=true): o e-mail aparece no log e
 * nao sai de verdade. Para enviar em producao basta preencher as credenciais SMTP e virar
 * SMTP_MOCK=false — nenhum codigo muda.
 *
 * ⚠️ O painel e sempre a fonte da verdade; o e-mail e so aviso. Por isso toda falha de envio e
 * engolida com log: um SMTP fora do ar NAO pode impedir uma aprovacao ou uma baixa de pagamento.
 *
 * LGPD: estes e-mails saem do sistema levando dado pessoal para uma caixa postal externa. Por isso
 * o corpo carrega o minimo — nome e categoria do atleta, nunca CPF, RG ou documento. Quem precisa
 * do detalhe abre o painel autenticado.
 */
@ApplicationScoped
public class EmailService {

    private static final Logger LOG = Logger.getLogger(EmailService.class);

    @Inject Mailer mailer;

    /** Caixa da federação que recebe os avisos operacionais. */
    @ConfigProperty(name = "fht.email.admin", defaultValue = "contato@fht.org.br")
    String emailAdmin;

    @ConfigProperty(name = "fht.email.habilitado", defaultValue = "true")
    boolean habilitado;

    /* ───────────── filiação de clube ───────────── */

    public void avisarNovaSolicitacaoClube(String nomeClube, String cidade, String representante, String email) {
        enviar(emailAdmin,
                "Nova solicitação de filiação: " + nomeClube,
                """
                <h2>Nova solicitação de filiação</h2>
                <p>Um clube pediu filiação e está aguardando análise no painel.</p>
                <ul>
                  <li><b>Clube:</b> %s</li>
                  <li><b>Cidade:</b> %s</li>
                  <li><b>Representante:</b> %s</li>
                  <li><b>E-mail:</b> %s</li>
                </ul>
                <p>Acesse o painel da FHT para conferir os documentos e aprovar.</p>
                """.formatted(nomeClube, cidade, representante, email));
    }

    public void confirmarSolicitacaoRecebida(String emailDestino, String nomeClube, String representante) {
        enviar(emailDestino,
                "Recebemos sua solicitação de filiação — FHT",
                """
                <h2>Solicitação recebida</h2>
                <p>Olá, %s.</p>
                <p>Recebemos a solicitação de filiação do <b>%s</b>. A federação vai conferir os
                documentos e você será avisado assim que a análise terminar.</p>
                <p><b>Importante:</b> o acesso ao painel do clube só é liberado após a aprovação.
                O login será este e-mail e a senha que você escolheu no cadastro.</p>
                """.formatted(representante, nomeClube));
    }

    public void avisarClubeAprovado(String emailDestino, String nomeClube, String representante) {
        enviar(emailDestino,
                "Filiação aprovada — acesso liberado — FHT",
                """
                <h2>Filiação aprovada</h2>
                <p>Olá, %s.</p>
                <p>A filiação do <b>%s</b> foi aprovada pela FHT e o acesso ao painel do clube
                está liberado.</p>
                <p>Entre com <b>este e-mail</b> e a senha que você escolheu no cadastro. Se
                esqueceu a senha, fale com a federação.</p>
                <p>No painel você pode cadastrar a comissão técnica, incluir os atletas e pagar
                a anuidade.</p>
                """.formatted(representante, nomeClube));
    }

    public void avisarClubeRejeitado(String emailDestino, String nomeClube, String motivo) {
        enviar(emailDestino,
                "Sobre a filiação do " + nomeClube + " — FHT",
                """
                <h2>Solicitação não aprovada</h2>
                <p>A solicitação de filiação do <b>%s</b> não pôde ser aprovada neste momento.</p>
                <p><b>Motivo:</b> %s</p>
                <p>Se precisar de esclarecimentos ou quiser reenviar a solicitação, entre em
                contato com a federação.</p>
                """.formatted(nomeClube, motivo == null || motivo.isBlank() ? "não informado" : motivo));
    }

    /* ───────────── pagamento em lote ───────────── */

    /** O requisito é explícito: a federação precisa saber QUAIS atletas o pagamento cobre. */
    public void avisarPagamentoRecebido(String nomeClube, String protocolo, BigDecimal valor,
                                        List<String> atletas) {
        String linhas = atletas.stream().map(n -> "<li>" + n + "</li>").reduce("", String::concat);
        enviar(emailAdmin,
                "Pagamento de anuidade recebido: " + nomeClube + " (" + protocolo + ")",
                """
                <h2>Pagamento aguardando conferência</h2>
                <ul>
                  <li><b>Clube:</b> %s</li>
                  <li><b>Protocolo:</b> %s</li>
                  <li><b>Valor:</b> R$ %s</li>
                  <li><b>Atletas:</b> %d</li>
                </ul>
                <h3>Atletas cobertos por este pagamento</h3>
                <ol>%s</ol>
                <p>O comprovante está no painel da FHT, em Financeiro. Dê baixa por lá para
                ativar os atletas.</p>
                """.formatted(nomeClube, protocolo, valor.toPlainString(), atletas.size(), linhas));
    }

    public void avisarBaixaConfirmada(String emailDestino, String nomeClube, String protocolo,
                                      int ativados, int pendentes) {
        String aviso = pendentes > 0
                ? "<p><b>Atenção:</b> %d atleta(s) ainda não foram ativados porque falta documentação. Confira no painel do clube.</p>".formatted(pendentes)
                : "";
        enviar(emailDestino,
                "Pagamento confirmado (" + protocolo + ") — FHT",
                """
                <h2>Pagamento confirmado</h2>
                <p>A FHT confirmou o pagamento <b>%s</b> do <b>%s</b>.</p>
                <p>%d atleta(s) foram ativados e já estão aptos.</p>
                %s
                """.formatted(protocolo, nomeClube, ativados, aviso));
    }

    public void avisarPagamentoRejeitado(String emailDestino, String nomeClube, String protocolo, String motivo) {
        enviar(emailDestino,
                "Pagamento não confirmado (" + protocolo + ") — FHT",
                """
                <h2>Pagamento não confirmado</h2>
                <p>O pagamento <b>%s</b> do <b>%s</b> não pôde ser confirmado.</p>
                <p><b>Motivo:</b> %s</p>
                <p>Os atletas voltaram para a lista de pendentes. Você pode enviar um novo
                comprovante pelo painel do clube.</p>
                """.formatted(protocolo, nomeClube, motivo == null || motivo.isBlank() ? "não informado" : motivo));
    }

    /* ───────────── envio ───────────── */

    private void enviar(String destino, String assunto, String corpoHtml) {
        if (!habilitado) return;
        if (destino == null || destino.isBlank()) {
            LOG.warnf("E-mail '%s' não enviado: destinatário ausente", assunto);
            return;
        }
        try {
            mailer.send(Mail.withHtml(destino, assunto, envolver(corpoHtml)));
            LOG.infof("E-mail enviado para %s: %s", destino, assunto);
        } catch (Exception e) {
            // Aviso não pode derrubar operação: o painel continua sendo a fonte da verdade.
            LOG.errorf(e, "Falha ao enviar e-mail para %s: %s", destino, assunto);
        }
    }

    private String envolver(String conteudo) {
        return """
               <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.5">
                 %s
                 <hr style="border:none;border-top:1px solid #ddd;margin:24px 0">
                 <p style="font-size:12px;color:#666">
                   Federação de Handebol do Tocantins — mensagem automática, não responda a este e-mail.
                 </p>
               </div>
               """.formatted(conteudo);
    }
}
