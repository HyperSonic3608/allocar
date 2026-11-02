package com.allocar.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PropostaAluguel(Automovel automovel, LocalDate inicio, LocalDate fim,
                             TipoContrato tipo, BigDecimal valorTotal) {

    public PropostaAluguel {
        automovel = Validacao.obrigatorio(automovel, "Automóvel");
        inicio = Validacao.obrigatorio(inicio, "Início do aluguel");
        fim = Validacao.obrigatorio(fim, "Fim do aluguel");
        Validacao.exigir(fim.isAfter(inicio), "O fim do aluguel deve ser posterior ao início.");
        tipo = Validacao.obrigatorio(tipo, "Tipo de contrato");
        valorTotal = Validacao.dinheiro(valorTotal, "Valor total do aluguel", false);
    }
}
