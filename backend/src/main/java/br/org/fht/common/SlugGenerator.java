package br.org.fht.common;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Gera slugs amigáveis para URL a partir de um texto (ex.: "Notícia do Handebol!" -> "noticia-do-handebol").
 * Remove acentos, deixa minúsculo e troca qualquer coisa não alfanumérica por hífen.
 */
public final class SlugGenerator {

    private SlugGenerator() {}

    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "noticia";
        }
        String semAcento = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String slug = semAcento.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
        return slug.isBlank() ? "noticia" : slug;
    }
}
