package com.allocar.backend.model;

public final class Empresa extends Agente {

    public Empresa(String nome, String cnpj, Endereco endereco) {
        super(nome, cnpj, endereco);
    }

    @Override
    public TipoAgente getTipo() {
        return TipoAgente.EMPRESA;
    }
}
