package com.allocar.backend.service;

import com.allocar.backend.exception.RegraDeNegocioException;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/** Conta proveniente do contexto autenticado; o identificador não deve vir livremente do HTTP. */
@Service
@Profile("supabase")
public class ContextoBanco {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;

    public ContextoBanco(JdbcTemplate jdbc, TransactionTemplate transactions) {
        this.jdbc = jdbc;
        this.transactions = transactions;
    }

    public <T> T comConta(UUID conta, Supplier<T> operacao) {
        if (conta == null) throw new RegraDeNegocioException("Conta autenticada obrigatória.");
        return transactions.execute(status -> {
            String anterior = jdbc.queryForObject("select current_setting('allocar.conta_id', true)", String.class);
            if (anterior != null && !anterior.isBlank() && !anterior.equals(conta.toString())) {
                throw new RegraDeNegocioException("Uma transação não pode trocar de responsável.");
            }
            jdbc.queryForObject("select set_config('allocar.conta_id', ?, true)", String.class, conta.toString());
            UUID titular = jdbc.queryForObject("select allocar.ator()", UUID.class);
            if (titular == null) throw new RegraDeNegocioException("Conta inativa ou instituição não habilitada.");
            return operacao.get();
        });
    }
}
