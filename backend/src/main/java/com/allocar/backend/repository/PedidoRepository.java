package com.allocar.backend.repository;

import com.allocar.backend.model.ResumoPedido;
import com.allocar.backend.model.StatusPedido;
import com.allocar.backend.model.TipoContrato;
import com.allocar.backend.service.ContextoBanco;
import com.allocar.backend.exception.ApiException;
import com.allocar.backend.model.ApiDtos.*;
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

    private static final org.springframework.jdbc.core.RowMapper<ResumoPedido> MAPPER=(rs,n)->
        new ResumoPedido(rs.getObject("id",UUID.class),rs.getString("numero"),rs.getObject("cliente_id",UUID.class),
            rs.getObject("agente_responsavel_id",UUID.class),rs.getObject("automovel_id",UUID.class),
            rs.getDate("inicio").toLocalDate(),rs.getDate("fim").toLocalDate(),TipoContrato.valueOf(rs.getString("tipo_contrato")),
            rs.getBigDecimal("valor_total"),StatusPedido.valueOf(rs.getString("status")),rs.getLong("versao"));

    public Pagina<ResumoPedido> paginar(StatusPedido status,int pagina,int tamanho) {
        String filtro=status==null?null:status.name();
        return Consultas.pagina(jdbc,"select * from allocar.pedidos_aluguel where (?::text is null or status=?)",
            "criado_em desc,id",MAPPER,pagina,tamanho,filtro,filtro);
    }
    public ResumoPedido obter(UUID id) {
        return jdbc.query("select * from allocar.pedidos_aluguel where id=?",MAPPER,id)
            .stream().findFirst().orElseThrow(ApiException::naoEncontrado);
    }
    public ResumoPedido bloquear(UUID id) {
        return jdbc.query("select * from allocar.pedidos_aluguel where id=? for update",MAPPER,id)
            .stream().findFirst().orElseThrow(ApiException::naoEncontrado);
    }
    public UUID criar(UUID cliente,CriarPedido input) {
        var p=input.proposta();
        return jdbc.queryForObject("""
            insert into allocar.pedidos_aluguel(numero,cliente_id,agente_responsavel_id,automovel_id,inicio,fim,tipo_contrato,valor_total)
            values (?,?,?,?,?,?,?,?) returning id
            """,UUID.class,"AL-"+UUID.randomUUID(),cliente,input.agenteResponsavelId(),p.automovelId(),p.inicio(),p.fim(),p.tipo().name(),p.valorTotal());
    }
    public void alterar(UUID id,AlterarPedido input) {
        var p=input.proposta();
        jdbc.update("""
            update allocar.pedidos_aluguel set automovel_id=?,inicio=?,fim=?,tipo_contrato=?,valor_total=?,
                status='EM_ANALISE',versao=versao+1 where id=?
            """,p.automovelId(),p.inicio(),p.fim(),p.tipo().name(),p.valorTotal(),id);
    }
    public void reenviar(UUID id) { jdbc.update("update allocar.pedidos_aluguel set status='EM_ANALISE',versao=versao+1 where id=?",id); }
    public void cancelar(UUID id) { jdbc.update("update allocar.pedidos_aluguel set status='CANCELADO' where id=?",id); }

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
