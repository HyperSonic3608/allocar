package com.allocar.backend.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Fotografia imutável do cadastro efetivamente considerado em um parecer. */
public record DadosCliente(UUID clienteId, long versaoCadastro, String nome, String rg, String cpf,
                           Endereco endereco, String profissao, List<VinculoEmpregaticio> vinculos) {

    public DadosCliente {
        clienteId = Validacao.obrigatorio(clienteId, "Cliente");
        Validacao.exigir(versaoCadastro > 0, "A versão do cadastro deve ser positiva.");
        nome = Validacao.texto(nome, "Nome");
        rg = Validacao.texto(rg, "RG");
        cpf = Validacao.texto(cpf, "CPF");
        endereco = Validacao.obrigatorio(endereco, "Endereço");
        profissao = Validacao.texto(profissao, "Profissão");
        Validacao.obrigatorio(vinculos, "Vínculos empregatícios");
        Validacao.exigir(vinculos.size() <= Cliente.MAXIMO_VINCULOS, "O cliente pode ter até três vínculos.");
        for (var vinculo : vinculos) {
            Validacao.obrigatorio(vinculo, "Vínculo empregatício");
        }
        vinculos = List.copyOf(vinculos);
    }

    public BigDecimal rendaTotal() {
        return vinculos.stream().map(VinculoEmpregaticio::getRendimento)
                .reduce(new BigDecimal("0.00"), BigDecimal::add);
    }
}
