package com.allocar.backend.model;

import com.allocar.backend.exception.RegraDeNegocioException;
import java.math.BigDecimal;
import java.math.RoundingMode;

final class Validacao {

    private Validacao() {}

    static void exigir(boolean condicao, String mensagem) {
        if (!condicao) {
            throw new RegraDeNegocioException(mensagem);
        }
    }

    static <T> T obrigatorio(T valor, String campo) {
        exigir(valor != null, campo + " é obrigatório.");
        return valor;
    }

    static String texto(String valor, String campo) {
        obrigatorio(valor, campo);
        exigir(!valor.isBlank(), campo + " é obrigatório.");
        return valor.strip();
    }

    static BigDecimal dinheiro(
        BigDecimal valor,
        String campo,
        boolean aceitaZero
    ) {
        obrigatorio(valor, campo);
        exigir(
            aceitaZero ? valor.signum() >= 0 : valor.signum() > 0,
            campo +
                (aceitaZero ? " não pode ser negativo." : " deve ser positivo.")
        );
        try {
            return valor.setScale(2, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException exception) {
            throw new RegraDeNegocioException(
                campo + " deve ser informado em centavos, sem arredondamento."
            );
        }
    }
}
