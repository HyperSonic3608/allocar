package com.allocar.backend.model;

import static org.junit.jupiter.api.Assertions.*;

import com.allocar.backend.exception.RegraDeNegocioException;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class CadastroTests {

    private final CenarioDominio c = new CenarioDominio();

    @Test
    void limitaTresVinculosESomaRendimentosSemPermitirAlteracaoExterna() {
        for (int i = 0; i < 3; i++) {
            c.cliente.adicionarVinculo(
                c.contaCliente,
                new VinculoEmpregaticio(
                    "Empresa " + i,
                    new BigDecimal("2000.10")
                )
            );
        }
        long versao = c.cliente.getVersaoCadastro();
        assertThrows(RegraDeNegocioException.class, () ->
            c.cliente.adicionarVinculo(
                c.contaCliente,
                new VinculoEmpregaticio("Quarta empresa", BigDecimal.TEN)
            )
        );
        assertEquals(3, c.cliente.getVinculos().size());
        assertEquals(new BigDecimal("6000.30"), c.cliente.calcularRendaTotal());
        assertEquals(versao, c.cliente.getVersaoCadastro());
        assertThrows(UnsupportedOperationException.class, () ->
            c.cliente.getVinculos().clear()
        );
    }

    @Test
    void alteracaoDeRendaPreservaIdentidadeDoVinculoEHistoricoDosDados() {
        var vinculo = new VinculoEmpregaticio(
            "Empresa A",
            new BigDecimal("2000")
        );
        c.cliente.adicionarVinculo(c.contaCliente, vinculo);
        var anterior = c.cliente.obterDadosFinanceiros();
        c.cliente.atualizarVinculo(
            c.contaCliente,
            vinculo.getId(),
            "Empresa B",
            new BigDecimal("2500.50")
        );
        assertEquals(
            vinculo.getId(),
            c.cliente.getVinculos().getFirst().getId()
        );
        assertEquals(
            "Empresa A",
            anterior.vinculos().getFirst().getEmpregador()
        );
        assertEquals(new BigDecimal("2000.00"), anterior.rendaTotal());
        assertEquals(new BigDecimal("2500.50"), c.cliente.calcularRendaTotal());
        assertEquals(
            anterior.versaoCadastro() + 1,
            c.cliente.getVersaoCadastro()
        );
        c.cliente.removerVinculo(c.contaCliente, vinculo.getId());
        assertEquals(new BigDecimal("0.00"), c.cliente.calcularRendaTotal());
    }

    @Test
    void rejeitaVinculoDuplicadoOuDeIdentificadorDesconhecido() {
        var vinculo = new VinculoEmpregaticio("Empresa A", BigDecimal.ZERO);
        c.cliente.adicionarVinculo(c.contaCliente, vinculo);
        assertThrows(RegraDeNegocioException.class, () ->
            c.cliente.adicionarVinculo(c.contaCliente, vinculo)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.cliente.atualizarVinculo(
                c.contaCliente,
                UUID.randomUUID(),
                "Outra",
                BigDecimal.TEN
            )
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.cliente.removerVinculo(c.contaCliente, UUID.randomUUID())
        );
        assertEquals(1, c.cliente.getVinculos().size());
    }

    @ParameterizedTest
    @ValueSource(strings = { "-0.01", "1000.001" })
    void rejeitaRendimentoNegativoOuComFracaoDeCentavo(String valor) {
        assertThrows(RegraDeNegocioException.class, () ->
            new VinculoEmpregaticio("Empresa", new BigDecimal(valor))
        );
    }

    @Test
    void atualizacaoInvalidaNaoAlteraParcialmenteOCadastro() {
        long versao = c.cliente.getVersaoCadastro();
        assertThrows(RegraDeNegocioException.class, () ->
            c.cliente.atualizarCadastro(
                c.contaCliente,
                "Novo nome",
                "Outro RG",
                "Outro CPF",
                c.endereco,
                " "
            )
        );
        assertEquals("Ana Silva", c.cliente.getNome());
        assertEquals("123.456.789-00", c.cliente.getCpf());
        assertEquals(versao, c.cliente.getVersaoCadastro());
    }

    @Test
    void somenteOTitularAtivoPodeManterOCadastro() {
        assertThrows(RegraDeNegocioException.class, () ->
            c.cliente.atualizarCadastro(
                c.contaEmpresa,
                "Outro nome",
                "RG",
                "CPF",
                c.endereco,
                "Profissão"
            )
        );
        c.contaCliente.desativar();
        assertThrows(RegraDeNegocioException.class, () ->
            c.cliente.adicionarVinculo(
                c.contaCliente,
                new VinculoEmpregaticio("Empresa", BigDecimal.TEN)
            )
        );
        assertTrue(c.cliente.getVinculos().isEmpty());
    }

    @Test
    void contaExigeCadastroUnicoEInstituicaoValidada() {
        assertThrows(RegraDeNegocioException.class, () ->
            new Conta("outra", "hash", c.cliente)
        );
        var empresa = new Empresa("Empresa", "CNPJ", c.endereco);
        var conta = new Conta("institucional", "hash", empresa);
        assertFalse(conta.isAtiva());
        assertThrows(RegraDeNegocioException.class, conta::ativar);
        empresa.validarInstituicao();
        conta.ativar();
        assertTrue(conta.isAtiva());
    }

    @Test
    void construcaoDeContaInvalidaNaoOcupaOVinculoDoTitular() {
        var cliente = c.novoCliente("Outra pessoa", "CPF");
        assertThrows(RegraDeNegocioException.class, () ->
            new Conta("usuario", " ", cliente)
        );
        assertTrue(cliente.getConta().isEmpty());
        var conta = new Conta("usuario", "hash", cliente);
        assertSame(conta, cliente.getConta().orElseThrow());
        assertSame(cliente, conta.getParte());
    }

    @Test
    void trocaDeHashInvalidaPreservaCredencialAnteriorESoOcorreEmContaAtiva() {
        String anterior = c.contaCliente.getSenhaHash();
        assertThrows(RegraDeNegocioException.class, () ->
            c.contaCliente.alterarSenhaHash(" ")
        );
        assertEquals(anterior, c.contaCliente.getSenhaHash());
        c.contaCliente.alterarSenhaHash("outro-hash");
        c.contaCliente.desativar();
        assertThrows(RegraDeNegocioException.class, () ->
            c.contaCliente.alterarSenhaHash("novo-hash")
        );
        assertEquals("outro-hash", c.contaCliente.getSenhaHash());
    }

    @Test
    void identificacaoEEnderecoExigemCamposObrigatorios() {
        assertThrows(RegraDeNegocioException.class, () ->
            c.novoCliente(" ", "CPF")
        );
        assertThrows(RegraDeNegocioException.class, () ->
            c.novoCliente("Nome", null)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            new Endereco("Rua", "1", null, "Bairro", "Cidade", " ", "CEP")
        );
        assertThrows(RegraDeNegocioException.class, () ->
            new Automovel("MAT", 2025, "Marca", "Modelo", " ", c.empresa)
        );
        assertThrows(RegraDeNegocioException.class, () ->
            new Automovel("MAT", 2025, "Marca", "Modelo", "PLACA", null)
        );
    }
}
