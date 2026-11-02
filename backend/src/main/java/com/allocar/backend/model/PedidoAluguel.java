package com.allocar.backend.model;

import com.allocar.backend.exception.RegraDeNegocioException;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public final class PedidoAluguel extends Entidade {

    private final Cliente cliente;
    private final Agente agenteResponsavel;
    private final Clock relogio;
    private final List<ParecerFinanceiro> pareceres = new ArrayList<>();
    private PropostaAluguel proposta;
    private StatusPedido status = StatusPedido.EM_ANALISE;
    private long versao = 1;
    private ContratoAluguel contrato;

    private PedidoAluguel(
        Cliente cliente,
        Agente agenteResponsavel,
        PropostaAluguel proposta,
        Clock relogio
    ) {
        this.cliente = cliente;
        this.agenteResponsavel = agenteResponsavel;
        this.proposta = proposta;
        this.relogio = relogio;
    }

    public static PedidoAluguel solicitar(
        Conta solicitante,
        Agente agenteResponsavel,
        PropostaAluguel proposta
    ) {
        return solicitar(
            solicitante,
            agenteResponsavel,
            proposta,
            Clock.systemUTC()
        );
    }

    public static PedidoAluguel solicitar(
        Conta solicitante,
        Agente agenteResponsavel,
        PropostaAluguel proposta,
        Clock relogio
    ) {
        Validacao.obrigatorio(
            solicitante,
            "Conta do solicitante"
        ).exigirAtiva();
        Validacao.exigir(
            solicitante.getParte() instanceof Cliente,
            "Somente clientes solicitam aluguéis."
        );
        Validacao.obrigatorio(
            agenteResponsavel,
            "Agente responsável"
        ).exigirHabilitado();
        return new PedidoAluguel(
            (Cliente) solicitante.getParte(),
            agenteResponsavel,
            Validacao.obrigatorio(proposta, "Proposta"),
            Validacao.obrigatorio(relogio, "Relógio")
        );
    }

    public synchronized void alterar(
        Conta autor,
        PropostaAluguel proposta,
        long versaoEsperada
    ) {
        exigirAutorDaProposta(autor);
        exigirAlteravel();
        exigirVersao(versaoEsperada);
        var novaProposta = Validacao.obrigatorio(proposta, "Proposta");
        this.proposta = novaProposta;
        versao++;
        status = StatusPedido.EM_ANALISE;
    }

    public synchronized void submeterParaAnalise(
        Conta autor,
        long versaoEsperada
    ) {
        exigirAutorDaProposta(autor);
        exigirAlteravel();
        exigirVersao(versaoEsperada);
        versao++;
        status = StatusPedido.EM_ANALISE;
    }

    public synchronized void cancelar(Conta autor, long versaoEsperada) {
        cliente.exigirTitular(autor);
        exigirAlteravel();
        exigirVersao(versaoEsperada);
        status = StatusPedido.CANCELADO;
        versao++;
    }

    public synchronized ParecerFinanceiro avaliar(
        Conta autor,
        DecisaoParecer decisao,
        String justificativa,
        long versaoEsperada,
        long versaoCadastroEsperada
    ) {
        agenteResponsavel.exigirTitular(autor);
        exigirVersao(versaoEsperada);
        synchronized (cliente) {
            Validacao.exigir(
                getStatus() == StatusPedido.EM_ANALISE,
                "Somente pedidos em análise recebem parecer."
            );
            var dados = cliente.obterDadosFinanceiros();
            Validacao.exigir(
                dados.versaoCadastro() == versaoCadastroEsperada,
                "O cadastro foi alterado; recarregue os dados antes de avaliar."
            );
            var parecer = new ParecerFinanceiro(
                getId(),
                agenteResponsavel,
                decisao,
                justificativa,
                versao,
                relogio.instant(),
                dados,
                proposta
            );
            pareceres.add(parecer);
            status = parecer.isPositivo()
                ? StatusPedido.APROVADO
                : StatusPedido.REPROVADO;
            return parecer;
        }
    }

    public synchronized ContratoAluguel executarContrato(
        Conta autor,
        long versaoEsperada
    ) {
        agenteResponsavel.exigirTitular(autor);
        exigirVersao(versaoEsperada);
        Validacao.exigir(contrato == null, "O pedido já possui contrato.");
        synchronized (cliente) {
            Validacao.exigir(
                getStatus() == StatusPedido.APROVADO,
                "A execução exige aprovação financeira vigente."
            );
            var parecer = getParecerVigente().orElseThrow(() ->
                new RegraDeNegocioException("A execução exige parecer vigente.")
            );
            Validacao.exigir(
                parecer.isPositivo(),
                "A execução exige parecer positivo."
            );
            var novoContrato = new ContratoAluguel(
                this,
                proposta,
                parecer,
                relogio.instant()
            );
            contrato = novoContrato;
            status = StatusPedido.EM_EXECUCAO;
            return contrato;
        }
    }

    public synchronized void exigirAcesso(Conta autor) {
        Validacao.obrigatorio(autor, "Conta do responsável").exigirAtiva();
        boolean titularOuAgente =
            autor.getParte().equals(cliente) ||
            autor.getParte().equals(agenteResponsavel);
        boolean bancoConcedente =
            contrato != null &&
            contrato
                .getCredito()
                .map(credito ->
                    credito.getBancoConcedente().equals(autor.getParte())
                )
                .orElse(false);
        Validacao.exigir(
            titularOuAgente || bancoConcedente,
            "O pedido não pertence ao escopo desta conta."
        );
    }

    private void exigirAutorDaProposta(Conta autor) {
        Validacao.obrigatorio(autor, "Conta do responsável").exigirAtiva();
        Validacao.exigir(
            autor.getParte().equals(cliente) ||
                autor.getParte().equals(agenteResponsavel),
            "Somente o cliente titular ou o agente responsável pode alterar o pedido."
        );
    }

    private void exigirAlteravel() {
        Validacao.exigir(
            getStatus().permiteAlteracaoOuCancelamento(),
            "Pedidos cancelados ou em execução não podem ser alterados ou cancelados."
        );
    }

    private void exigirVersao(long esperada) {
        Validacao.exigir(
            versao == esperada,
            "A versão do pedido está desatualizada; recarregue o pedido."
        );
    }

    public synchronized StatusPedido getStatus() {
        if (
            (status == StatusPedido.APROVADO ||
                status == StatusPedido.REPROVADO) &&
            getParecerVigente().isEmpty()
        ) {
            return StatusPedido.EM_ANALISE;
        }
        return status;
    }

    public synchronized Optional<ParecerFinanceiro> getParecerVigente() {
        if (pareceres.isEmpty()) {
            return Optional.empty();
        }
        var ultimo = pareceres.getLast();
        return ultimo.getVersaoPedido() == versao &&
            ultimo.getDadosAnalisados().versaoCadastro() ==
                cliente.getVersaoCadastro()
            ? Optional.of(ultimo)
            : Optional.empty();
    }

    public synchronized List<ParecerFinanceiro> getPareceres() {
        return List.copyOf(pareceres);
    }

    public synchronized Optional<ContratoAluguel> getContrato() {
        return Optional.ofNullable(contrato);
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Agente getAgenteResponsavel() {
        return agenteResponsavel;
    }

    public synchronized PropostaAluguel getProposta() {
        return proposta;
    }

    public synchronized Automovel getAutomovel() {
        return proposta.automovel();
    }

    public synchronized LocalDate getInicio() {
        return proposta.inicio();
    }

    public synchronized LocalDate getFim() {
        return proposta.fim();
    }

    public synchronized TipoContrato getTipoContrato() {
        return proposta.tipo();
    }

    public synchronized BigDecimal getValorTotal() {
        return proposta.valorTotal();
    }

    public synchronized long getVersao() {
        return versao;
    }
}
