package com.allocar.backend.model;

import java.time.Instant;
import java.util.UUID;

public final class ParecerFinanceiro extends Entidade {

    private final UUID pedidoId;
    private final Agente agente;
    private final DecisaoParecer decisao;
    private final String justificativa;
    private final long versaoPedido;
    private final Instant emitidoEm;
    private final DadosCliente dadosAnalisados;
    private final PropostaAluguel propostaAnalisada;

    ParecerFinanceiro(UUID pedidoId, Agente agente, DecisaoParecer decisao, String justificativa,
                       long versaoPedido, Instant emitidoEm, DadosCliente dadosAnalisados,
                       PropostaAluguel propostaAnalisada) {
        this.pedidoId = Validacao.obrigatorio(pedidoId, "Pedido");
        this.agente = Validacao.obrigatorio(agente, "Agente avaliador");
        this.decisao = Validacao.obrigatorio(decisao, "Decisão");
        this.justificativa = Validacao.texto(justificativa, "Justificativa");
        Validacao.exigir(versaoPedido > 0, "A versão do pedido deve ser positiva.");
        this.versaoPedido = versaoPedido;
        this.emitidoEm = Validacao.obrigatorio(emitidoEm, "Data do parecer");
        this.dadosAnalisados = Validacao.obrigatorio(dadosAnalisados, "Dados analisados");
        this.propostaAnalisada = Validacao.obrigatorio(propostaAnalisada, "Proposta analisada");
    }

    public boolean isPositivo() {
        return decisao == DecisaoParecer.APROVADO;
    }

    public UUID getPedidoId() {
        return pedidoId;
    }

    public Agente getAgente() {
        return agente;
    }

    public DecisaoParecer getDecisao() {
        return decisao;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public long getVersaoPedido() {
        return versaoPedido;
    }

    public Instant getEmitidoEm() {
        return emitidoEm;
    }

    public DadosCliente getDadosAnalisados() {
        return dadosAnalisados;
    }

    public PropostaAluguel getPropostaAnalisada() {
        return propostaAnalisada;
    }
}
