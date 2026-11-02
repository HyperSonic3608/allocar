package com.allocar.backend.model;

import static org.junit.jupiter.api.Assertions.*;

import com.allocar.backend.exception.RegraDeNegocioException;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;

class PedidoAluguelTests {

    private final CenarioDominio c = new CenarioDominio();

    @Test
    void solicitacaoJaSubmeteAPropostaParaAnalise() {
        var pedido = c.pedido();
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
        assertEquals(1, pedido.getVersao());
        assertEquals(c.proposta, pedido.getProposta());
        assertEquals(c.cliente, pedido.getCliente());
        assertEquals(c.empresa, pedido.getAgenteResponsavel());
        assertTrue(pedido.getPareceres().isEmpty());
        assertTrue(pedido.getContrato().isEmpty());
    }

    @Test
    void solicitacaoExigeContaAtivaDeClienteEAgenteHabilitado() {
        assertThrows(RegraDeNegocioException.class, () ->
            PedidoAluguel.solicitar(c.contaEmpresa, c.empresa, c.proposta)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            PedidoAluguel.solicitar(null, c.empresa, c.proposta)
        );
        c.contaEmpresa.desativar();
        assertThrows(RegraDeNegocioException.class, () ->
            PedidoAluguel.solicitar(c.contaCliente, c.empresa, c.proposta)
        );
        c.contaEmpresa.ativar();
        c.contaCliente.desativar();
        assertThrows(RegraDeNegocioException.class, c::pedido);
    }

    @Test
    void propostaExigePeriodoCorretoETodosOsDados() {
        assertThrows(RegraDeNegocioException.class, () ->
            new PropostaAluguel(
                c.automovel,
                c.proposta.inicio(),
                c.proposta.inicio(),
                TipoContrato.PADRAO,
                BigDecimal.TEN
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            new PropostaAluguel(
                c.automovel,
                c.proposta.fim(),
                c.proposta.inicio(),
                TipoContrato.PADRAO,
                BigDecimal.TEN
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            new PropostaAluguel(
                null,
                c.proposta.inicio(),
                c.proposta.fim(),
                TipoContrato.PADRAO,
                BigDecimal.TEN
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            new PropostaAluguel(
                c.automovel,
                null,
                c.proposta.fim(),
                TipoContrato.PADRAO,
                BigDecimal.TEN
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            new PropostaAluguel(
                c.automovel,
                c.proposta.inicio(),
                c.proposta.fim(),
                null,
                BigDecimal.TEN
            )
        );
    }

    @ParameterizedTest
    @ValueSource(strings = { "0", "-1", "1250.001" })
    void naoAceitaValorDeAluguelInvalido(String valor) {
        assertThrows(RegraDeNegocioException.class, () -> c.proposta(valor));
    }

    @Test
    void parecerRegistraAutorDecisaoDataEVersoesDosDados() {
        c.cliente.adicionarVinculo(
            c.contaCliente,
            new VinculoEmpregaticio("Empregador", new BigDecimal("6000"))
        );
        var pedido = c.pedido();
        var parecer = c.avaliar(pedido, DecisaoParecer.APROVADO);
        assertEquals(StatusPedido.APROVADO, pedido.getStatus());
        assertSame(parecer, pedido.getParecerVigente().orElseThrow());
        assertEquals(pedido.getId(), parecer.getPedidoId());
        assertEquals(pedido.getVersao(), parecer.getVersaoPedido());
        assertEquals(
            c.cliente.getVersaoCadastro(),
            parecer.getDadosAnalisados().versaoCadastro()
        );
        assertEquals(
            new BigDecimal("6000.00"),
            parecer.getDadosAnalisados().rendaTotal()
        );
        assertEquals(c.empresa, parecer.getAgente());
        assertEquals(CenarioDominio.AGORA, parecer.getEmitidoEm());
        assertThrows(UnsupportedOperationException.class, () ->
            pedido.getPareceres().clear()
        );
    }

    @Test
    void justificativaEDecisaoObrigatoriasNaoProduzemMudancaParcial() {
        var pedido = c.pedido();
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.avaliar(
                c.contaEmpresa,
                DecisaoParecer.APROVADO,
                " ",
                1,
                c.cliente.getVersaoCadastro()
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.avaliar(
                c.contaEmpresa,
                null,
                "Motivo",
                1,
                c.cliente.getVersaoCadastro()
            )
        );
        assertTrue(pedido.getPareceres().isEmpty());
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
    }

    @Test
    void acessoEAlteracaoRespeitamTitularEInstituicaoResponsavel() {
        var pedido = c.pedido();
        var intruso = c.contaAtiva(c.novoCliente("Outro", "CPF"), "outro");
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.exigirAcesso(intruso)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.alterar(intruso, c.proposta("1000"), 1)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.cancelar(c.contaEmpresa, 1)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.avaliar(
                c.contaCliente,
                DecisaoParecer.APROVADO,
                "Motivo",
                1,
                1
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.banco.modificarPedido(c.contaBanco, pedido, c.proposta, 1)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.banco.avaliarPedido(
                c.contaBanco,
                pedido,
                DecisaoParecer.APROVADO,
                "Motivo",
                1,
                1
            )
        );
        assertDoesNotThrow(() -> pedido.exigirAcesso(c.contaCliente));
        assertDoesNotThrow(() -> pedido.exigirAcesso(c.contaEmpresa));
        assertEquals(1, pedido.getVersao());
    }

    @Test
    void clienteEAgentePodemAlterarMasAParecerAnteriorNaoAutorizaANovaVersao() {
        var pedido = c.pedido();
        var anterior = c.avaliar(pedido, DecisaoParecer.APROVADO);
        pedido.alterar(c.contaCliente, c.proposta("1100"), 1);
        assertEquals(2, pedido.getVersao());
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
        assertTrue(pedido.getParecerVigente().isEmpty());
        assertEquals(anterior, pedido.getPareceres().getFirst());
        assertEquals(
            new BigDecimal("1250.00"),
            anterior.getPropostaAnalisada().valorTotal()
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaEmpresa, 2)
        );
        c.avaliar(pedido, DecisaoParecer.REPROVADO);
        c.empresa.modificarPedido(
            c.contaEmpresa,
            pedido,
            c.proposta("1050"),
            2
        );
        assertEquals(3, pedido.getVersao());
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
        assertEquals(new BigDecimal("1050.00"), pedido.getValorTotal());
    }

    @Test
    void versaoDesatualizadaNaoSobrescrevePropostaOuParecer() {
        var pedido = c.pedido();
        pedido.alterar(c.contaCliente, c.proposta("1000"), 1);
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.alterar(c.contaCliente, c.proposta("900"), 1)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.cancelar(c.contaCliente, 1)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.avaliar(
                c.contaEmpresa,
                DecisaoParecer.APROVADO,
                "Motivo",
                1,
                1
            )
        );
        assertEquals(new BigDecimal("1000.00"), pedido.getValorTotal());
        assertTrue(pedido.getPareceres().isEmpty());
    }

    @Test
    void mudancaNoCadastroExigeReanaliseEPreservaDadosDoParecerAntigo() {
        var pedido = c.pedido();
        var antigo = c.avaliar(pedido, DecisaoParecer.APROVADO);
        long cadastroAnterior = c.cliente.getVersaoCadastro();
        c.cliente.atualizarCadastro(
            c.contaCliente,
            "Ana Atualizada",
            "Novo RG",
            "Novo CPF",
            c.endereco,
            "Professora"
        );
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
        assertTrue(pedido.getParecerVigente().isEmpty());
        assertEquals("Ana Silva", antigo.getDadosAnalisados().nome());
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaEmpresa, 1)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.avaliar(
                c.contaEmpresa,
                DecisaoParecer.APROVADO,
                "Motivo",
                1,
                cadastroAnterior
            )
        );
        c.avaliar(pedido, DecisaoParecer.APROVADO);
        assertDoesNotThrow(() -> pedido.executarContrato(c.contaEmpresa, 1));
        assertEquals(2, pedido.getPareceres().size());
    }

    @Test
    void mudancaDeRendaTambemInvalidaParecerSemApagarAHistoriaFinanceira() {
        var pedido = c.pedido();
        var parecerSemRenda = c.avaliar(pedido, DecisaoParecer.REPROVADO);
        var vinculo = new VinculoEmpregaticio(
            "Empregador",
            new BigDecimal("6000")
        );
        c.cliente.adicionarVinculo(c.contaCliente, vinculo);
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
        assertEquals(
            new BigDecimal("0.00"),
            parecerSemRenda.getDadosAnalisados().rendaTotal()
        );
        var aprovado = c.avaliar(pedido, DecisaoParecer.APROVADO);
        c.cliente.removerVinculo(c.contaCliente, vinculo.getId());
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
        assertEquals(
            new BigDecimal("6000.00"),
            aprovado.getDadosAnalisados().rendaTotal()
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.executarContrato(c.contaEmpresa, 1)
        );
        assertEquals(2, pedido.getPareceres().size());
    }

    @ParameterizedTest
    @EnumSource(
        value = StatusPedido.class,
        names = { "EM_ANALISE", "APROVADO", "REPROVADO" }
    )
    void clientePodeCancelarAntesDaExecucao(StatusPedido estado) {
        var pedido = c.pedido();
        if (estado != StatusPedido.EM_ANALISE) {
            c.avaliar(pedido, DecisaoParecer.valueOf(estado.name()));
        }
        pedido.cancelar(c.contaCliente, pedido.getVersao());
        assertEquals(StatusPedido.CANCELADO, pedido.getStatus());
        assertEquals(2, pedido.getVersao());
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.alterar(c.contaCliente, c.proposta, 2)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.submeterParaAnalise(c.contaCliente, 2)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.cancelar(c.contaCliente, 2)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.avaliar(
                c.contaEmpresa,
                DecisaoParecer.APROVADO,
                "Motivo",
                2,
                c.cliente.getVersaoCadastro()
            )
        );
    }

    @Test
    void reenvioInvalidaAprovacaoEContaDesativadaNaoOperaPedido() {
        var pedido = c.pedido();
        c.avaliar(pedido, DecisaoParecer.APROVADO);
        pedido.submeterParaAnalise(c.contaEmpresa, 1);
        assertEquals(2, pedido.getVersao());
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
        c.contaCliente.desativar();
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.exigirAcesso(c.contaCliente)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            pedido.cancelar(c.contaCliente, 2)
        );
    }
}
