package com.allocar.backend.model;

import java.util.Optional;

public abstract sealed class Parte extends Entidade permits Cliente, Agente {

    private String nome;
    private Endereco endereco;
    private volatile Conta conta;

    protected Parte(String nome, Endereco endereco) {
        this.nome = Validacao.texto(nome, "Nome");
        this.endereco = Validacao.obrigatorio(endereco, "Endereço");
    }

    final synchronized void vincularConta(Conta conta) {
        Validacao.exigir(this.conta == null, "A parte já possui uma conta.");
        this.conta = Validacao.obrigatorio(conta, "Conta");
    }

    final void exigirTitular(Conta autor) {
        Validacao.obrigatorio(autor, "Conta do responsável").exigirAtiva();
        Validacao.exigir(autor.equals(conta), "A operação exige a conta do próprio titular.");
    }

    final void atualizarIdentificacao(String nome, Endereco endereco) {
        this.nome = nome;
        this.endereco = endereco;
    }

    void exigirAtivacaoPermitida() {
    }

    public final String getNome() {
        return nome;
    }

    public final Endereco getEndereco() {
        return endereco;
    }

    public final Optional<Conta> getConta() {
        return Optional.ofNullable(conta);
    }
}
