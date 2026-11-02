package com.allocar.backend.model;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

final class CenarioDominio {

    static final Instant AGORA = Instant.parse("2026-11-02T12:00:00Z");
    static final Clock RELOGIO = Clock.fixed(AGORA, ZoneOffset.UTC);
    final Endereco endereco = new Endereco("Rua das Flores", "120", null, "Centro", "São Paulo", "SP", "01000-000");
    final Cliente cliente = novoCliente("Ana Silva", "123.456.789-00");
    final Conta contaCliente = contaAtiva(cliente, "ana");
    final Empresa empresa = new Empresa("Hyper Locadora", "12.345.678/0001-90", endereco);
    final Conta contaEmpresa = contaAtiva(empresa, "empresa");
    final Banco banco = new Banco("Hyper Banco", "98.765.432/0001-00", endereco);
    final Conta contaBanco = contaAtiva(banco, "banco");
    final Automovel automovel = new Automovel("MAT-001", 2025, "Chevrolet", "Onix", "ABC1D23", empresa);
    final PropostaAluguel proposta = proposta("1250.00");

    Cliente novoCliente(String nome, String cpf) {
        return new Cliente(nome, "12.345.678-9", cpf, endereco, "Analista de sistemas");
    }

    Conta contaAtiva(Parte parte, String usuario) {
        var conta = new Conta(usuario, "hash-produzido-pelo-adaptador", parte);
        if (parte instanceof Agente agente) {
            agente.validarInstituicao();
        }
        conta.ativar();
        return conta;
    }

    PropostaAluguel proposta(String valor) {
        return new PropostaAluguel(automovel, LocalDate.of(2026, 12, 10), LocalDate.of(2026, 12, 15),
                TipoContrato.PADRAO, new BigDecimal(valor));
    }

    PedidoAluguel pedido() {
        return PedidoAluguel.solicitar(contaCliente, empresa, proposta, RELOGIO);
    }

    ParecerFinanceiro avaliar(PedidoAluguel pedido, DecisaoParecer decisao) {
        return empresa.avaliarPedido(contaEmpresa, pedido, decisao, "Cadastro e rendimentos analisados.",
                pedido.getVersao(), cliente.getVersaoCadastro());
    }

    ContratoAluguel contrato() {
        var pedido = pedido();
        avaliar(pedido, DecisaoParecer.APROVADO);
        return pedido.executarContrato(contaEmpresa, pedido.getVersao());
    }
}
