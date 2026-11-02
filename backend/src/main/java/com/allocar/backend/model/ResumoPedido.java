package com.allocar.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** Projeção de consulta; não substitui as operações e invariantes de PedidoAluguel. */
public record ResumoPedido(UUID id, String numero, UUID clienteId, UUID agenteResponsavelId,
                           UUID automovelId, LocalDate inicio, LocalDate fim, TipoContrato tipo,
                           BigDecimal valorTotal, StatusPedido status, long versao) {
}
