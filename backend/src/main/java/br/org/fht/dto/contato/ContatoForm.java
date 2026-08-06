package br.org.fht.dto.contato;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Mensagem do formulário "Fale com a FHT" do site público.
 *
 * <p>Não vira registro no banco: é encaminhada por e-mail à federação e descartada. Os limites de
 * tamanho existem porque o endpoint é aberto — sem eles, um POST com megabytes de texto vira
 * um e-mail impossível de ler ou uma forma barata de encher a caixa da federação.
 */
public record ContatoForm(

        @Schema(description = "Nome de quem está entrando em contato", required = true, example = "Maria Silva")
        @NotBlank(message = "Informe seu nome")
        @Size(max = 120, message = "Nome muito longo")
        String nome,

        @Schema(description = "E-mail para resposta", required = true, example = "maria@clube.com.br")
        @NotBlank(message = "Informe seu e-mail")
        @Email(message = "E-mail inválido")
        @Size(max = 255, message = "E-mail muito longo")
        String email,

        @Schema(description = "Telefone ou WhatsApp (opcional)", example = "(63) 99999-0000")
        @Size(max = 20, message = "Telefone muito longo")
        String telefone,

        @Schema(description = "Assunto da mensagem", required = true, example = "Filiação de clube")
        @NotBlank(message = "Informe o assunto")
        @Size(max = 150, message = "Assunto muito longo")
        String assunto,

        @Schema(description = "Conteúdo da mensagem", required = true)
        @NotBlank(message = "Escreva sua mensagem")
        @Size(max = 4000, message = "Mensagem muito longa (máximo 4000 caracteres)")
        String mensagem
) {}
