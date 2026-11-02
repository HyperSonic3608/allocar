package com.allocar.backend.model;

import java.util.Locale;

public record Endereco(String logradouro, String numero, String complemento, String bairro,
                       String cidade, String uf, String cep) {

    public Endereco {
        logradouro = Validacao.texto(logradouro, "Logradouro");
        numero = Validacao.texto(numero, "Número");
        complemento = complemento == null ? "" : complemento.strip();
        bairro = Validacao.texto(bairro, "Bairro");
        cidade = Validacao.texto(cidade, "Cidade");
        uf = Validacao.texto(uf, "UF").toUpperCase(Locale.ROOT);
        cep = Validacao.texto(cep, "CEP");
    }
}
