package com.allocar.backend.repository;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.service.ContaAutenticada;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;

@Repository
@Profile("supabase")
public class ContaRepository {
    private final JdbcTemplate jdbc;
    private final JsonMapper json=JsonMapper.builder().build();
    public ContaRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }

    /** Objeto interno, nunca retornado pelo controller nem persistido na sessão. */
    public record Credencial(ContaAutenticada conta, String hash, boolean habilitada) {
        @Override public String toString() { return "Credencial[dados omitidos]"; }
    }

    public Optional<Credencial> credencial(String usuario) {
        return jdbc.query("select * from allocar.credencial_login(?)",(rs,n)->new Credencial(
            new ContaAutenticada(rs.getObject("conta_id",UUID.class),rs.getObject("parte_id",UUID.class),
                rs.getString("usuario"),rs.getString("nome"),rs.getString("tipo")),
            rs.getString("senha_hash"),rs.getBoolean("habilitada")),usuario).stream().findFirst();
    }

    public CadastroCriado registrar(String tipo, Map<String,Object> dados, String hash) {
        return jdbc.queryForObject("select * from allocar.registrar_conta(?,?::jsonb,?)",(rs,n)->
            new CadastroCriado(rs.getObject("conta_id",UUID.class),rs.getObject("parte_id",UUID.class),
                rs.getString("usuario"),rs.getString("tipo"),rs.getBoolean("ativa")),
                tipo,json.writeValueAsString(dados),hash);
    }

    public ContaPublica atual(UUID contaId) {
        return jdbc.queryForObject("""
            select c.id,c.parte_id,c.usuario,p.nome,p.tipo from allocar.contas c
            join allocar.partes p on p.id=c.parte_id where c.id=?
            """,(rs,n)->new ContaPublica(rs.getObject("id",UUID.class),rs.getObject("parte_id",UUID.class),
                rs.getString("usuario"),rs.getString("nome"),rs.getString("tipo")),contaId);
    }

    public void desativar(UUID contaId) { jdbc.update("update allocar.contas set ativa=false where id=?",contaId); }
}
