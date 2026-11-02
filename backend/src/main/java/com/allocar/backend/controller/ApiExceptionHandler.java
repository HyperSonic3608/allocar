package com.allocar.backend.controller;

import com.allocar.backend.exception.*;
import com.allocar.backend.model.ApiDtos.ErroApi;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ErroApi> aplicacao(ApiException ex) { return erro(ex.getStatus(),ex.getCodigo(),ex.getMessage()); }
    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ErroApi> autenticacao(AuthenticationException ex) { return erro(401,"NAO_AUTENTICADO","Usuário ou senha inválidos, ou sessão sem acesso ativo."); }
    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErroApi> permissao(AccessDeniedException ex) { return erro(403,"ACESSO_NEGADO","Operação não autorizada para esta conta."); }
    @ExceptionHandler(RegraDeNegocioException.class)
    ResponseEntity<ErroApi> negocio(RegraDeNegocioException ex) { return erro(422,"REGRA_DE_NEGOCIO",ex.getMessage()); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErroApi> campos(MethodArgumentNotValidException ex) {
        var campos=new LinkedHashMap<String,String>();
        ex.getBindingResult().getFieldErrors().forEach(e->campos.putIfAbsent(e.getField(),e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new ErroApi(400,"DADOS_INVALIDOS","Confira os campos informados.",campos));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class,HandlerMethodValidationException.class,
        MethodArgumentTypeMismatchException.class,MissingServletRequestParameterException.class})
    ResponseEntity<ErroApi> formato(Exception ex) { return erro(400,"REQUISICAO_INVALIDA","Confira o JSON, os campos e os parâmetros da requisição."); }
    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErroApi> inexistente(Exception ex) { return erro(404,"NAO_ENCONTRADO","Recurso não encontrado."); }
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ErroApi> metodo(Exception ex) { return erro(405,"METODO_INVALIDO","Método HTTP não permitido para este recurso."); }
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ErroApi> tipo(Exception ex) { return erro(415,"TIPO_DE_CONTEUDO_INVALIDO","Envie o corpo com Content-Type application/json."); }
    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ErroApi> persistencia(DataAccessException ex) {
        Throwable causa=ex.getMostSpecificCause(); String estado=causa instanceof SQLException sql?sql.getSQLState():"";
        if ("23505".equals(estado)) return erro(409,"REGISTRO_DUPLICADO","Cadastro ou associação já existente.");
        if ("23503".equals(estado)) return erro(422,"REFERENCIA_INVALIDA","Uma referência informada não está disponível.");
        if ("23514".equals(estado) || "23502".equals(estado)) return erro(422,"REGRA_DE_NEGOCIO","A operação não atende às regras de negócio.");
        if ("42501".equals(estado)) return erro(403,"ACESSO_NEGADO","Operação não autorizada para esta conta.");
        if (java.util.Set.of("40001","40P01","55P03").contains(estado==null?"":estado))
            return erro(409,"CONCORRENCIA","Recarregue os dados e tente novamente.");
        if (ex instanceof DataAccessResourceFailureException || (estado!=null && (estado.startsWith("08") || estado.startsWith("57"))))
            return erro(503,"BANCO_INDISPONIVEL","Serviço temporariamente indisponível.");
        org.slf4j.LoggerFactory.getLogger(getClass()).error("Falha de persistência; SQLState={}",estado);
        return erro(500,"ERRO_INTERNO","Não foi possível concluir a operação.");
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ErroApi> inesperado(Exception ex) {
        org.slf4j.LoggerFactory.getLogger(getClass()).error("Falha interna da API: {}",ex.getClass().getSimpleName());
        return erro(500,"ERRO_INTERNO","Não foi possível concluir a operação.");
    }
    private ResponseEntity<ErroApi> erro(int status,String codigo,String mensagem) {
        return ResponseEntity.status(status).body(new ErroApi(status,codigo,mensagem,Map.of()));
    }
}
