package com.allocar.backend.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Contratos JSON da API; entidades e hashes de senha nunca são respostas HTTP. */
public final class ApiDtos {
    private ApiDtos() {}

    public record Login(@NotBlank @Size(max=120) String usuario,
                        @NotBlank @Size(max=256) String senha) {
        @Override public String toString() { return "Login[credenciais omitidas]"; }
    }

    public record EnderecoInput(@NotBlank @Size(max=200) String logradouro,
        @NotBlank @Size(max=30) String numero, @Size(max=100) String complemento,
        @NotBlank @Size(max=100) String bairro, @NotBlank @Size(max=100) String cidade,
        @NotBlank @Pattern(regexp="[a-zA-Z]{2}") String uf,
        @NotBlank @Pattern(regexp="[0-9]{5}-?[0-9]{3}") String cep) {
        public Endereco toEndereco() { return new Endereco(logradouro,numero,complemento,bairro,cidade,uf,cep); }
    }

    public record VinculoInput(@NotBlank @Size(max=160) String empregador,
        @NotNull @DecimalMin("0") @Digits(integer=12,fraction=2) BigDecimal rendimento) {}

    public record CadastroCliente(@NotBlank @Size(min=3,max=120) @Pattern(regexp="[a-zA-Z0-9._-]+") String usuario,
        @NotBlank @Size(min=12,max=256) String senha, @NotBlank @Size(max=160) String nome,
        @NotBlank @Size(max=30) String rg, @NotBlank @Size(max=30) String cpf,
        @NotBlank @Size(max=120) String profissao, @NotNull @Valid EnderecoInput endereco,
        @NotNull @Size(max=3) List<@NotNull @Valid VinculoInput> vinculos) {
        @Override public String toString() { return "CadastroCliente[dados pessoais omitidos]"; }
    }

    public record CadastroAgente(@NotBlank @Size(min=3,max=120) @Pattern(regexp="[a-zA-Z0-9._-]+") String usuario,
        @NotBlank @Size(min=12,max=256) String senha, @NotBlank @Size(max=160) String nome,
        @NotBlank @Size(max=30) String cnpj, @NotNull TipoAgente tipo,
        @NotNull @Valid EnderecoInput endereco) {
        @Override public String toString() { return "CadastroAgente[dados pessoais omitidos]"; }
    }

    public record CadastroCriado(UUID contaId, UUID parteId, String usuario, String tipo, boolean ativa) {}
    public record ContaPublica(UUID contaId, UUID parteId, String usuario, String nome, String tipo) {}
    public record VinculoView(UUID id, String empregador, BigDecimal rendimento) {}
    public record ClienteView(UUID id, String nome, String rg, String cpf, String profissao,
        Endereco endereco, List<VinculoView> vinculos, BigDecimal rendaTotal, long versaoCadastro) {}
    public record AtualizarCliente(@Positive long versaoCadastro, @NotBlank @Size(max=160) String nome,
        @NotBlank @Size(max=30) String rg, @NotBlank @Size(max=30) String cpf,
        @NotBlank @Size(max=120) String profissao, @NotNull @Valid EnderecoInput endereco) {}
    public record ManterVinculo(@Positive long versaoCadastro, @NotBlank @Size(max=160) String empregador,
        @NotNull @DecimalMin("0") @Digits(integer=12,fraction=2) BigDecimal rendimento) {}
    public record AgenteView(UUID id, String nome, String tipo, String cnpj) {}

    public record PropostaInput(@NotNull UUID automovelId, @NotNull LocalDate inicio,
        @NotNull LocalDate fim, @NotNull TipoContrato tipo,
        @NotNull @DecimalMin(value="0",inclusive=false) @Digits(integer=12,fraction=2) BigDecimal valorTotal) {
        @AssertTrue(message="O fim do aluguel deve ser posterior ao início.")
        public boolean isPeriodoValido() { return inicio==null || fim==null || fim.isAfter(inicio); }
    }
    public record CriarPedido(@NotNull UUID agenteResponsavelId, @NotNull @Valid PropostaInput proposta) {}
    public record AlterarPedido(@Positive long versao, @NotNull @Valid PropostaInput proposta) {}
    public record Versao(@Positive long versao) {}
    public record Avaliacao(@Positive long versaoPedido, @Positive long versaoCadastro,
        @NotNull DecisaoParecer decisao, @NotBlank @Size(max=2000) String justificativa) {}
    public record ParecerView(UUID id, UUID pedidoId, UUID agenteId, DecisaoParecer decisao,
        String justificativa, long versaoPedido, long versaoCadastro, Instant emitidoEm,
        Object dadosCliente, Object propostaAnalisada) {}
    public record ContratoView(UUID id, String numero, UUID pedidoId, UUID parecerAprovadorId,
        TipoContrato tipo, BigDecimal valorTotal, UUID proprietarioRegistradoId, Instant executadoEm,
        UUID creditoId) {}
    public record CreditoInput(@NotBlank @Size(max=80) String numero,
        @NotNull @DecimalMin(value="0",inclusive=false) @Digits(integer=12,fraction=2) BigDecimal valor,
        @NotNull @DecimalMin("0") @Digits(integer=8,fraction=6) BigDecimal taxa) {}
    public record CreditoView(UUID id, String numero, UUID bancoConcedenteId,
        BigDecimal valor, BigDecimal taxa, Instant criadoEm, UUID contratoId) {}
    public record AssociarCredito(@NotNull UUID creditoId) {}
    public record DetalhePedido(ResumoPedido pedido, VeiculoCatalogo automovel,
        ClienteView cliente, List<ParecerView> pareceres, ContratoView contrato) {}
    public record Pagina<T>(List<T> itens, int pagina, int tamanho, long total) {}
    public record ErroApi(int status, String codigo, String mensagem, Map<String,String> campos) {}
}
