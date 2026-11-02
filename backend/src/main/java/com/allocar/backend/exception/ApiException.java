package com.allocar.backend.exception;

/** Erro de aplicação com código HTTP e mensagem pública. */
public final class ApiException extends RuntimeException {
    private final int status;
    private final String codigo;
    public ApiException(int status, String codigo, String mensagem) {
        super(mensagem); this.status=status; this.codigo=codigo;
    }
    public int getStatus() { return status; }
    public String getCodigo() { return codigo; }
    public static ApiException naoEncontrado() { return new ApiException(404,"NAO_ENCONTRADO","Recurso não encontrado."); }
    public static ApiException conflito() { return new ApiException(409,"VERSAO_DESATUALIZADA","Os dados foram alterados; recarregue antes de continuar."); }
}
