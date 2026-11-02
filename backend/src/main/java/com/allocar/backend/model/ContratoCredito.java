package com.allocar.backend.model;

import java.math.BigDecimal;
import java.util.Optional;

public final class ContratoCredito extends Entidade {

    private final String numero;
    private final BigDecimal valor;
    private final BigDecimal taxa;
    private final Banco bancoConcedente;
    private volatile ContratoAluguel aluguel;

    ContratoCredito(String numero, BigDecimal valor, BigDecimal taxa, Banco bancoConcedente) {
        this.numero = Validacao.texto(numero, "Número do crédito");
        this.valor = Validacao.dinheiro(valor, "Valor do crédito", false);
        this.taxa = Validacao.obrigatorio(taxa, "Taxa do crédito");
        Validacao.exigir(taxa.signum() >= 0, "A taxa do crédito não pode ser negativa.");
        this.bancoConcedente = Validacao.obrigatorio(bancoConcedente, "Banco concedente");
    }

    public void associarAoAluguel(Conta autor, ContratoAluguel aluguel) {
        Validacao.obrigatorio(aluguel, "Contrato de aluguel").associarCredito(autor, this);
    }

    synchronized void vincular(Conta autor, ContratoAluguel aluguel) {
        bancoConcedente.exigirTitular(autor);
        Validacao.exigir(this.aluguel == null, "O crédito já está associado a um aluguel.");
        this.aluguel = aluguel;
    }

    public Optional<ContratoAluguel> getAluguel() {
        return Optional.ofNullable(aluguel);
    }

    public String getNumero() {
        return numero;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public BigDecimal getTaxa() {
        return taxa;
    }

    public Banco getBancoConcedente() {
        return bancoConcedente;
    }
}
