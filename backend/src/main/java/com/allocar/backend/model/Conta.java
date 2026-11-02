package com.allocar.backend.model;

/** Recebe somente hashes produzidos pelo adaptador de autenticação, nunca senhas em claro. */
public final class Conta extends Entidade {

    private final String usuario;
    private final Parte parte;
    private volatile String senhaHash;
    private volatile boolean ativa;

    public Conta(String usuario, String senhaHash, Parte parte) {
        this.usuario = Validacao.texto(usuario, "Usuário");
        this.senhaHash = Validacao.texto(senhaHash, "Hash da senha");
        this.parte = Validacao.obrigatorio(parte, "Titular");
        parte.vincularConta(this);
    }

    public void ativar() {
        parte.exigirAtivacaoPermitida();
        ativa = true;
    }

    public void desativar() {
        ativa = false;
    }

    public void alterarSenhaHash(String senhaHash) {
        exigirAtiva();
        this.senhaHash = Validacao.texto(senhaHash, "Hash da senha");
    }

    void exigirAtiva() {
        Validacao.exigir(ativa, "A conta deve estar ativa para realizar esta operação.");
        parte.exigirAtivacaoPermitida();
    }

    public String getUsuario() {
        return usuario;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public Parte getParte() {
        return parte;
    }

    public boolean isAtiva() {
        return ativa;
    }
}
