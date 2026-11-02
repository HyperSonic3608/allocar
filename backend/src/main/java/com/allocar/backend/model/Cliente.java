package com.allocar.backend.model;

import com.allocar.backend.exception.RegraDeNegocioException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class Cliente extends Parte {

    public static final int MAXIMO_VINCULOS = 3;

    private String rg;
    private String cpf;
    private String profissao;
    private long versaoCadastro = 1;
    private final List<VinculoEmpregaticio> vinculos = new ArrayList<>();

    public Cliente(
        String nome,
        String rg,
        String cpf,
        Endereco endereco,
        String profissao
    ) {
        super(nome, endereco);
        this.rg = Validacao.texto(rg, "RG");
        this.cpf = Validacao.texto(cpf, "CPF");
        this.profissao = Validacao.texto(profissao, "Profissão");
    }

    public synchronized void atualizarCadastro(
        Conta autor,
        String nome,
        String rg,
        String cpf,
        Endereco endereco,
        String profissao
    ) {
        exigirTitular(autor);
        var novoNome = Validacao.texto(nome, "Nome");
        var novoRg = Validacao.texto(rg, "RG");
        var novoCpf = Validacao.texto(cpf, "CPF");
        var novoEndereco = Validacao.obrigatorio(endereco, "Endereço");
        var novaProfissao = Validacao.texto(profissao, "Profissão");
        atualizarIdentificacao(novoNome, novoEndereco);
        this.rg = novoRg;
        this.cpf = novoCpf;
        this.profissao = novaProfissao;
        versaoCadastro++;
    }

    public synchronized void adicionarVinculo(
        Conta autor,
        VinculoEmpregaticio vinculo
    ) {
        exigirTitular(autor);
        Validacao.obrigatorio(vinculo, "Vínculo empregatício");
        Validacao.exigir(
            vinculos.size() < MAXIMO_VINCULOS,
            "O cliente pode ter até três vínculos."
        );
        Validacao.exigir(
            !vinculos.contains(vinculo),
            "O vínculo já pertence ao cadastro."
        );
        vinculos.add(vinculo);
        versaoCadastro++;
    }

    public synchronized void atualizarVinculo(
        Conta autor,
        UUID vinculoId,
        String empregador,
        BigDecimal rendimento
    ) {
        exigirTitular(autor);
        int indice = indiceDoVinculo(vinculoId);
        var atualizado = vinculos
            .get(indice)
            .atualizado(empregador, rendimento);
        vinculos.set(indice, atualizado);
        versaoCadastro++;
    }

    public synchronized void removerVinculo(Conta autor, UUID vinculoId) {
        exigirTitular(autor);
        vinculos.remove(indiceDoVinculo(vinculoId));
        versaoCadastro++;
    }

    private int indiceDoVinculo(UUID id) {
        Validacao.obrigatorio(id, "Identificador do vínculo");
        for (int i = 0; i < vinculos.size(); i++) {
            if (vinculos.get(i).getId().equals(id)) {
                return i;
            }
        }
        throw new RegraDeNegocioException("O vínculo não pertence ao cliente.");
    }

    public synchronized DadosCliente obterDadosFinanceiros() {
        return new DadosCliente(
            getId(),
            versaoCadastro,
            getNome(),
            rg,
            cpf,
            getEndereco(),
            profissao,
            vinculos
        );
    }

    public BigDecimal calcularRendaTotal() {
        return obterDadosFinanceiros().rendaTotal();
    }

    public synchronized List<VinculoEmpregaticio> getVinculos() {
        return List.copyOf(vinculos);
    }

    public String getRg() {
        return rg;
    }

    public String getCpf() {
        return cpf;
    }

    public String getProfissao() {
        return profissao;
    }

    public synchronized long getVersaoCadastro() {
        return versaoCadastro;
    }
}
