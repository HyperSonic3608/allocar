package com.allocar.backend.model;

import java.math.BigDecimal;

public final class Banco extends Agente {

    public Banco(String nome, String cnpj, Endereco endereco) {
        super(nome, cnpj, endereco);
    }

    public ContratoCredito concederCredito(Conta autor, String numero, BigDecimal valor, BigDecimal taxa) {
        exigirTitular(autor);
        return new ContratoCredito(numero, valor, taxa, this);
    }

    @Override
    public TipoAgente getTipo() {
        return TipoAgente.BANCO;
    }
}
