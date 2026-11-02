package com.allocar.backend.model;

import java.util.UUID;

public record VeiculoCatalogo(UUID id, String matricula, int ano, String marca, String modelo,
                              String placa, UUID proprietarioId) {
}
