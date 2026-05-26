package br.org.fht.common;

public final class CPFValidator {

    private CPFValidator() {}

    public static boolean isValid(String cpf) {
        if (cpf == null) return false;
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() != 11) return false;
        if (digits.chars().distinct().count() == 1) return false;

        int d1 = calcDigit(digits, 9);
        int d2 = calcDigit(digits, 10);

        return digits.charAt(9) - '0' == d1 && digits.charAt(10) - '0' == d2;
    }

    private static int calcDigit(String digits, int len) {
        int sum = 0;
        for (int i = 0; i < len; i++) {
            sum += (digits.charAt(i) - '0') * (len + 1 - i);
        }
        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
