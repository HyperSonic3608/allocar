package com.allocar.backend.model;

import java.util.Locale;

public final class Automovel extends Entidade {

    private final String matricula;
    private final int ano;
    private final String marca;
    private final String modelo;
    private final String placa;
    private Parte proprietario;

    public Automovel(String matricula, int ano, String marca, String modelo, String placa, Parte proprietario) {
        this.matricula = Validacao.texto(matricula, "Matrícula");
        Validacao.exigir(ano > 0 && ano <= 9999, "O ano deve ter um valor positivo de até quatro dígitos.");
        this.ano = ano;
        this.marca = Validacao.texto(marca, "Marca");
        this.modelo = Validacao.texto(modelo, "Modelo");
        this.placa = Validacao.texto(placa, "Placa").toUpperCase(Locale.ROOT);
        this.proprietario = Validacao.obrigatorio(proprietario, "Proprietário");
    }

    public void registrarProprietario(Parte proprietario) {
        this.proprietario = Validacao.obrigatorio(proprietario, "Proprietário");
    }

    public String getMatricula() {
        return matricula;
    }

    public int getAno() {
        return ano;
    }

    public String getMarca() {
        return marca;
    }

    public String getModelo() {
        return modelo;
    }

    public String getPlaca() {
        return placa;
    }

    public Parte getProprietario() {
        return proprietario;
    }
}
