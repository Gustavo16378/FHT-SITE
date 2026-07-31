package br.org.fht.common;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Fuso da federacao. O container roda em UTC, entao {@code LocalDate.now()} sem zona vira o dia
 * seguinte a partir das 21h de Palmas — e todo status derivado de data escorregaria 3 horas.
 * Toda regra de negocio que depende de "que dia e hoje" deve usar {@link #hoje()}.
 */
public final class Fuso {

    public static final ZoneId TOCANTINS = ZoneId.of("America/Araguaina");

    private Fuso() {}

    public static LocalDate hoje() {
        return LocalDate.now(TOCANTINS);
    }
}
