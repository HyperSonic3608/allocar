package com.allocar.backend.repository;

import com.allocar.backend.model.ResumoPedido;
import com.allocar.backend.model.StatusPedido;
import com.allocar.backend.model.TipoContrato;
import com.allocar.backend.service.ContextoBanco;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Profile("supabase")
public class PedidoRepository {
    private final JdbcTemplate jdbc;
    private final ContextoBanco contexto;

    public PedidoRepository(JdbcTemplate jdbc, ContextoBanco contexto) {
        this.jdbc = jdbc;
        this.contexto = contexto;
    }

    public List<ResumoPedido> listar(UUID conta) {
        return contexto.comConta(conta, () -> jdbc.query("""
            select id, numero, cliente_id, agente_responsavel_id, automovel_id,
                   inicio, fim, tipo_contrato, valor_total, status, versao
            from allocar.pedidos_aluguel order by criado_em desc, numero
            """, (rs, row) -> new ResumoPedido(rs.getObject("id", UUID.class), rs.getString("numero"),
                rs.getObject("cliente_id", UUID.class), rs.getObject("agente_responsavel_id", UUID.class),
                rs.getObject("automovel_id", UUID.class), rs.getDate("inicio").toLocalDate(),
                rs.getDate("fim").toLocalDate(), TipoContrato.valueOf(rs.getString("tipo_contrato")),
                rs.getBigDecimal("valor_total"), StatusPedido.valueOf(rs.getString("status")), rs.getLong("versao"))));
    }
}
