package com.allocar.backend.service;

import java.io.Serializable;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;

/** Único principal persistido na sessão, sem senha ou hash. */
public record ContaAutenticada(UUID contaId, UUID parteId, String usuario, String nome, String tipo)
        implements Serializable {
    public void exigirCliente() { if (!"CLIENTE".equals(tipo)) throw new AccessDeniedException("Operação exclusiva do cliente."); }
    public void exigirAgente() { if ("CLIENTE".equals(tipo)) throw new AccessDeniedException("Operação exclusiva de agentes."); }
    public void exigirBanco() { if (!"BANCO".equals(tipo)) throw new AccessDeniedException("Operação exclusiva de bancos."); }
}
