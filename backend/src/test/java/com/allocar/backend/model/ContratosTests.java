package com.allocar.backend.model;

import static org.junit.jupiter.api.Assertions.*;

import com.allocar.backend.exception.RegraDeNegocioException;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;

class ContratosTests {

    private final CenarioDominio c = new CenarioDominio();

    @ParameterizedTest
    @EnumSource(
        value = StatusPedido.class,
        names = { "EM_ANALISE", "REPROVADO", "CANCELADO" }
    )
    void execucaoExigeParecerPositivo(StatusPedido estado) {
        var pedido = c.pedido();
        if (estado == StatusPedido.REPROVADO) {
            c.avaliar(pedido, DecisaoParecer.REPROVADO);
        } else if (estado == StatusPedido.CANCELADO) {
            pedido.cancelar(c.contaCliente, 1);
        }
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaEmpresa, pedido.getVersao())
        );
        assertTrue(pedido.getContrato().isEmpty());
    }

    @Test
    void contratoAprovadoPodeSerExecutadoSemCreditoEGuardaCondicoes() {
        var contrato = c.contrato();
        var pedido = contrato.getPedido();
        assertEquals(StatusPedido.EM_EXECUCAO, pedido.getStatus());
        assertSame(contrato, pedido.getContrato().orElseThrow());
        assertEquals(TipoContrato.PADRAO, contrato.getTipo());
        assertEquals(new BigDecimal("1250.00"), contrato.getValorTotal());
        assertEquals(CenarioDominio.AGORA, contrato.getExecutadoEm());
        assertEquals(c.empresa, contrato.getProprietarioRegistrado());
        assertEquals(
            pedido.getPareceres().getFirst(),
            contrato.getParecerAprovador()
        );
        assertTrue(contrato.getCredito().isEmpty());
        c.cliente.atualizarCadastro(
            c.contaCliente,
            "Outro nome",
            "RG",
            "CPF",
            c.endereco,
            "Outra profissão"
        );
        assertEquals(StatusPedido.EM_EXECUCAO, pedido.getStatus());
        assertEquals(
            "Ana Silva",
            contrato.getParecerAprovador().getDadosAnalisados().nome()
        );
    }

    @Test
    void contratoExecutadoEUnicoEPedidoFicaImutavel() {
        var contrato = c.contrato();
        var pedido = contrato.getPedido();
        long versao = pedido.getVersao();
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaEmpresa, versao)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.alterar(c.contaCliente, c.proposta("900"), versao)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.cancelar(c.contaCliente, versao)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.submeterParaAnalise(c.contaEmpresa, versao)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.avaliar(pedido, DecisaoParecer.REPROVADO)
        );
        assertSame(contrato, pedido.getContrato().orElseThrow());
        assertEquals(new BigDecimal("1250.00"), contrato.getValorTotal());
    }

    @Test
    void somenteOAgenteResponsavelExecutaAVersaoAtual() {
        var pedido = c.pedido();
        c.avaliar(pedido, DecisaoParecer.APROVADO);
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaCliente, 1)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaBanco, 1)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaEmpresa, 0)
        );
        c.contaEmpresa.desativar();
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaEmpresa, 1)
        );
        assertTrue(pedido.getContrato().isEmpty());
    }

    @ParameterizedTest
    @EnumSource(TipoAgente.class)
    void empresasEBancosPodemAvaliarPedidosDeSeuEscopo(TipoAgente tipo) {
        Agente agente = tipo == TipoAgente.BANCO ? c.banco : c.empresa;
        Conta conta = tipo == TipoAgente.BANCO ? c.contaBanco : c.contaEmpresa;
        var pedido = PedidoAluguel.solicitar(
            c.contaCliente,
            agente,
            c.proposta
        );
        agente.avaliarPedido(
            conta,
            pedido,
            DecisaoParecer.APROVADO,
            "Avaliação realizada",
            1,
            1
        );
        assertEquals(
            StatusPedido.EM_EXECUCAO,
            pedido.executarContrato(conta, 1).getPedido().getStatus()
        );
    }

    @Test
    void execucaoNaoTransfereAutomaticamenteOAutomovelEPropriedadeContratualFicaRegistrada() {
        for (Parte proprietario : List.of(c.cliente, c.empresa, c.banco)) {
            c.automovel.registrarProprietario(proprietario);
            var contrato = c.contrato();
            assertSame(proprietario, c.automovel.getProprietario());
            assertSame(proprietario, contrato.getProprietarioRegistrado());
            c.automovel.registrarProprietario(c.banco);
            assertSame(proprietario, contrato.getProprietarioRegistrado());
        }
    }

    @Test
    void somenteOBancoConcedenteAssociaCreditoComVinculoBidirecional() {
        var contrato = c.contrato();
        var credito = c.banco.concederCredito(
            c.contaBanco,
            "CR-001",
            new BigDecimal("1250"),
            new BigDecimal("1.25")
        );
        assertTrue(credito.getAluguel().isEmpty());
        assertThrows(RegraDeNegocioException.class, () ->
            credito.associarAoAluguel(c.contaEmpresa, contrato)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            credito.associarAoAluguel(c.contaCliente, contrato)
        );
        var outroBanco = new Banco("Outro banco", "OUTRO-CNPJ", c.endereco);
        var outraConta = c.contaAtiva(outroBanco, "outro-banco");
        assertThrows(RegraDeNegocioException.class, () ->
            contrato.associarCredito(outraConta, credito)
        );
        assertTrue(contrato.getCredito().isEmpty());
        assertTrue(credito.getAluguel().isEmpty());
        credito.associarAoAluguel(c.contaBanco, contrato);
        assertSame(credito, contrato.getCredito().orElseThrow());
        assertSame(contrato, credito.getAluguel().orElseThrow());
        assertSame(c.banco, credito.getBancoConcedente());
        assertEquals(
            StatusPedido.EM_EXECUCAO,
            contrato.getPedido().getStatus()
        );
        assertDoesNotThrow(() ->
            contrato.getPedido().exigirAcesso(c.contaBanco)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            contrato.getPedido().exigirAcesso(outraConta)
        );
    }

    @Test
    void rejeitaSegundoCreditoEReutilizacaoSemCorromperAssociacoes() {
        var primeiro = c.contrato();
        var segundo = c.contrato();
        var credito = c.banco.concederCredito(
            c.contaBanco,
            "CR-001",
            BigDecimal.TEN,
            BigDecimal.ZERO
        );
        var outroCredito = c.banco.concederCredito(
            c.contaBanco,
            "CR-002",
            BigDecimal.TEN,
            BigDecimal.ZERO
        );
        primeiro.associarCredito(c.contaBanco, credito);
        assertThrows(RegraDeNegocioException.class, () ->
            segundo.associarCredito(c.contaBanco, credito)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            primeiro.associarCredito(c.contaBanco, outroCredito)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            primeiro.associarCredito(c.contaBanco, credito)
        );
        assertSame(primeiro, credito.getAluguel().orElseThrow());
        assertSame(credito, primeiro.getCredito().orElseThrow());
        assertTrue(outroCredito.getAluguel().isEmpty());
        assertTrue(segundo.getCredito().isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = { "0", "-10", "1.001" })
    void rejeitaValorDeCreditoInvalido(String valor) {
        assertThrows(RegraDeNegocioException.class, () ->
            c.banco.concederCredito(
                c.contaBanco,
                "CR",
                new BigDecimal(valor),
                BigDecimal.ZERO
            )
        );
    }

    @Test
    void concessaoExigeContaDoBancoNumeroETaxaValidos() {
        assertThrows(RegraDeNegocioException.class, () ->
            c.banco.concederCredito(
                c.contaEmpresa,
                "CR",
                BigDecimal.TEN,
                BigDecimal.ZERO
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.banco.concederCredito(
                c.contaBanco,
                " ",
                BigDecimal.TEN,
                BigDecimal.ZERO
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.banco.concederCredito(
                c.contaBanco,
                "CR",
                BigDecimal.TEN,
                new BigDecimal("-0.01")
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.banco.concederCredito(c.contaBanco, "CR", BigDecimal.TEN, null)
        );
        var credito = c.banco.concederCredito(
            c.contaBanco,
            "CR",
            BigDecimal.TEN,
            BigDecimal.ZERO
        );
        c.contaBanco.desativar();
        assertThrows(RegraDeNegocioException.class, () ->
            c.banco.concederCredito(
                c.contaBanco,
                "CR2",
                BigDecimal.TEN,
                BigDecimal.ZERO
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.contrato().associarCredito(c.contaBanco, credito)
        );
        assertTrue(credito.getAluguel().isEmpty());
    }

    @Test
    void duasExecucoesSimultaneasNaoDuplicamOContratoEmMemoria()
        throws Exception {
        var pedido = c.pedido();
        c.avaliar(pedido, DecisaoParecer.APROVADO);
        var inicio = new CountDownLatch(1);
        Callable<Boolean> executar = () -> {
            assertTrue(inicio.await(5, TimeUnit.SECONDS));
            try {
                pedido.executarContrato(c.contaEmpresa, 1);
                return true;
            } catch (RegraDeNegocioException exception) {
                return false;
            }
        };
        try (var executor = Executors.newFixedThreadPool(2)) {
            Future<Boolean> primeiro = executor.submit(executar);
            Future<Boolean> segundo = executor.submit(executar);
            inicio.countDown();
            assertNotEquals(
                primeiro.get(5, TimeUnit.SECONDS),
                segundo.get(5, TimeUnit.SECONDS)
            );
        }
        assertEquals(StatusPedido.EM_EXECUCAO, pedido.getStatus());
        assertTrue(pedido.getContrato().isPresent());
    }

    @Test
    void doisAlugueisNaoConseguemAssociarOMesmoCreditoSimultaneamente()
        throws Exception {
        var primeiro = c.contrato();
        var segundo = c.contrato();
        var credito = c.banco.concederCredito(
            c.contaBanco,
            "CR",
            BigDecimal.TEN,
            BigDecimal.ZERO
        );
        var inicio = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var resultados = new java.util.ArrayList<Future<Boolean>>();
            for (var contrato : List.of(primeiro, segundo)) {
                resultados.add(
                    executor.submit(() -> {
                        assertTrue(inicio.await(5, TimeUnit.SECONDS));
                        try {
                            contrato.associarCredito(c.contaBanco, credito);
                            return true;
                        } catch (RegraDeNegocioException exception) {
                            return false;
                        }
                    })
                );
            }
            inicio.countDown();
            assertNotEquals(
                resultados.get(0).get(5, TimeUnit.SECONDS),
                resultados.get(1).get(5, TimeUnit.SECONDS)
            );
        }
        assertNotEquals(
            primeiro.getCredito().isPresent(),
            segundo.getCredito().isPresent()
        );
        assertSame(
            credito,
            credito.getAluguel().orElseThrow().getCredito().orElseThrow()
        );
    }
}
