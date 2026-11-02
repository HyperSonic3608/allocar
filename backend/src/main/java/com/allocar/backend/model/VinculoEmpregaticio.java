package com.allocar.backend.model;

import java.math.BigDecimal;
import java.util.UUID;

/** Vínculo imutável; sua substituição é controlada pelo cadastro do cliente. */
public final class VinculoEmpregaticio extends Entidade {

    private final String empregador;
    private final BigDecimal rendimento;

    public VinculoEmpregaticio(String empregador, BigDecimal rendimento) {
        this(UUID.randomUUID(), empregador, rendimento);
    }

    private VinculoEmpregaticio(UUID id, String empregador, BigDecimal rendimento) {
        super(id);
        this.empregador = Validacao.texto(empregador, "Empregador");
        this.rendimento = Validacao.dinheiro(rendimento, "Rendimento", true);
    }

    VinculoEmpregaticio atualizado(String empregador, BigDecimal rendimento) {
        return new VinculoEmpregaticio(getId(), empregador, rendimento);
    }

    public String getEmpregador() {
        return empregador;
    }

    public BigDecimal getRendimento() {
        return rendimento;
    }
}
