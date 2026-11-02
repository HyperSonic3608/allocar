package com.allocar.backend.exception;

/** Uma operação foi recusada sem modificar o estado do domínio. */
public class RegraDeNegocioException extends RuntimeException {

    public RegraDeNegocioException(String mensagem) {
        super(mensagem);
    }
}
