package com.allocar.backend.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

/** Criado exclusivamente pela execução de um pedido aprovado. */
public final class ContratoAluguel extends Entidade {

    private final PedidoAluguel pedido;
    private final TipoContrato tipo;
    private final BigDecimal valorTotal;
    private final Instant executadoEm;
    private final Parte proprietarioRegistrado;
    private final ParecerFinanceiro parecerAprovador;
    private volatile ContratoCredito credito;

    ContratoAluguel(PedidoAluguel pedido, PropostaAluguel proposta,
                    ParecerFinanceiro parecerAprovador, Instant executadoEm) {
        this.pedido = pedido;
        this.tipo = proposta.tipo();
        this.valorTotal = proposta.valorTotal();
        this.executadoEm = Validacao.obrigatorio(executadoEm, "Data de execução");
        this.parecerAprovador = parecerAprovador;
        this.proprietarioRegistrado = proposta.automovel().getProprietario();
    }

    public synchronized void associarCredito(Conta autor, ContratoCredito credito) {
        Validacao.obrigatorio(credito, "Crédito");
        Validacao.exigir(this.credito == null, "O contrato de aluguel já possui crédito.");
        credito.vincular(autor, this);
        this.credito = credito;
    }

    public Optional<ContratoCredito> getCredito() {
        return Optional.ofNullable(credito);
    }

    public PedidoAluguel getPedido() {
        return pedido;
    }

    public TipoContrato getTipo() {
        return tipo;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public Instant getExecutadoEm() {
        return executadoEm;
    }

    public Parte getProprietarioRegistrado() {
        return proprietarioRegistrado;
    }

    public ParecerFinanceiro getParecerAprovador() {
        return parecerAprovador;
    }
}
