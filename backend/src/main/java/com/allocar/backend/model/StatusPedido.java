package com.allocar.backend.model;

public enum StatusPedido {
    EM_ANALISE, APROVADO, REPROVADO, CANCELADO, EM_EXECUCAO;

    public boolean permiteAlteracaoOuCancelamento() {
        return this == EM_ANALISE || this == APROVADO || this == REPROVADO;
    }
}
