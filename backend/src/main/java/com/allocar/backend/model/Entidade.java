package com.allocar.backend.model;

import java.util.UUID;

public abstract class Entidade {

    private final UUID id;

    protected Entidade() {
        this(UUID.randomUUID());
    }

    protected Entidade(UUID id) {
        this.id = Validacao.obrigatorio(id, "Identificador");
    }

    public final UUID getId() {
        return id;
    }

    @Override
    public final boolean equals(Object outro) {
        return this == outro || outro != null && getClass() == outro.getClass()
                && id.equals(((Entidade) outro).id);
    }

    @Override
    public final int hashCode() {
        return id.hashCode();
    }
}
