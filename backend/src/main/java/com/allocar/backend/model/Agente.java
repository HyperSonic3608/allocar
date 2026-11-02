package com.allocar.backend.model;

public abstract sealed class Agente extends Parte permits Empresa, Banco {

    private final String cnpj;
    private volatile boolean instituicaoValidada;

    protected Agente(String nome, String cnpj, Endereco endereco) {
        super(nome, endereco);
        this.cnpj = Validacao.texto(cnpj, "CNPJ");
    }

    /** A confirmação da instituição é fornecida pelo caso de uso de cadastro institucional. */
    public void validarInstituicao() {
        instituicaoValidada = true;
    }

    @Override
    final void exigirAtivacaoPermitida() {
        Validacao.exigir(instituicaoValidada, "A instituição precisa ser validada antes da ativação.");
    }

    final void exigirHabilitado() {
        exigirAtivacaoPermitida();
        Validacao.exigir(getConta().isPresent(), "O agente precisa de uma conta.");
        getConta().orElseThrow().exigirAtiva();
    }

    public ParecerFinanceiro avaliarPedido(Conta autor, PedidoAluguel pedido, DecisaoParecer decisao,
                                           String justificativa, long versaoPedido, long versaoCadastro) {
        exigirTitular(autor);
        return Validacao.obrigatorio(pedido, "Pedido").avaliar(
                autor, decisao, justificativa, versaoPedido, versaoCadastro);
    }

    public void modificarPedido(Conta autor, PedidoAluguel pedido, PropostaAluguel proposta, long versaoPedido) {
        exigirTitular(autor);
        Validacao.obrigatorio(pedido, "Pedido").alterar(autor, proposta, versaoPedido);
    }

    public String getCnpj() {
        return cnpj;
    }

    public boolean isInstituicaoValidada() {
        return instituicaoValidada;
    }

    public abstract TipoAgente getTipo();
}
