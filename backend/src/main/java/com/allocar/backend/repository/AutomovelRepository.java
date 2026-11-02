package com.allocar.backend.repository;

import com.allocar.backend.model.VeiculoCatalogo;
import com.allocar.backend.service.ContextoBanco;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Profile("supabase")
public class AutomovelRepository {
    private final JdbcTemplate jdbc;
    private final ContextoBanco contexto;

    public AutomovelRepository(JdbcTemplate jdbc, ContextoBanco contexto) {
        this.jdbc = jdbc;
        this.contexto = contexto;
    }

    public List<VeiculoCatalogo> buscar(UUID conta, String marca, Integer ano) {
        return contexto.comConta(conta, () -> jdbc.query("""
            select id, matricula, ano, marca, modelo, placa, proprietario_id
            from allocar.automoveis
            where (?::text is null or lower(marca) = lower(?))
              and (?::integer is null or ano = ?)
            order by marca, modelo, matricula
            """, (rs, row) -> new VeiculoCatalogo(rs.getObject("id", UUID.class), rs.getString("matricula"),
                rs.getInt("ano"), rs.getString("marca"), rs.getString("modelo"), rs.getString("placa"),
                rs.getObject("proprietario_id", UUID.class)), marca, marca, ano, ano));
    }
}
