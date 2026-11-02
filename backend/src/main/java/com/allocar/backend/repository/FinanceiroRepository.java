package com.allocar.backend.repository;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.exception.ApiException;
import com.allocar.backend.model.*;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;

@Repository
@Profile("supabase")
public class FinanceiroRepository {
    private final JdbcTemplate jdbc;
    private final JsonMapper json=JsonMapper.builder().build();
    public FinanceiroRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }

    private final RowMapper<ParecerView> parecer=(rs,n)->new ParecerView(rs.getObject("id",UUID.class),
        rs.getObject("pedido_id",UUID.class),rs.getObject("agente_id",UUID.class),DecisaoParecer.valueOf(rs.getString("decisao")),
        rs.getString("justificativa"),rs.getLong("versao_pedido"),rs.getLong("versao_cadastro"),rs.getTimestamp("emitido_em").toInstant(),
        json.readTree(rs.getString("dados_cliente")),json.readTree(rs.getString("proposta_analisada")));
    private static final String CONTRATOS="""
        select c.*,a.credito_id from allocar.contratos_aluguel c
        left join allocar.associacoes_credito a on a.contrato_id=c.id
        """;
    private static final RowMapper<ContratoView> CONTRATO=(rs,n)->new ContratoView(rs.getObject("id",UUID.class),
        rs.getString("numero"),rs.getObject("pedido_id",UUID.class),rs.getObject("parecer_aprovador_id",UUID.class),
        TipoContrato.valueOf(rs.getString("tipo")),rs.getBigDecimal("valor_total"),rs.getObject("proprietario_registrado_id",UUID.class),
        rs.getTimestamp("executado_em").toInstant(),rs.getObject("credito_id",UUID.class));
    private static final String CREDITOS="""
        select c.*,a.contrato_id from allocar.contratos_credito c
        left join allocar.associacoes_credito a on a.credito_id=c.id
        """;
    private static final RowMapper<CreditoView> CREDITO=(rs,n)->new CreditoView(rs.getObject("id",UUID.class),
        rs.getString("numero"),rs.getObject("banco_concedente_id",UUID.class),rs.getBigDecimal("valor"),rs.getBigDecimal("taxa"),
        rs.getTimestamp("criado_em").toInstant(),rs.getObject("contrato_id",UUID.class));

    public List<ParecerView> pareceres(UUID pedido) {
        return jdbc.query("select * from allocar.pareceres_financeiros where pedido_id=? order by emitido_em,id",parecer,pedido);
    }
    public ParecerView avaliar(UUID pedido,UUID agente,Avaliacao input) {
        return jdbc.queryForObject("""
            insert into allocar.pareceres_financeiros(pedido_id,agente_id,decisao,justificativa,versao_pedido,versao_cadastro)
            values (?,?,?,?,?,?) returning *
            """,parecer,pedido,agente,input.decisao().name(),input.justificativa().strip(),input.versaoPedido(),input.versaoCadastro());
    }
    public ContratoView contratoDoPedido(UUID pedido) {
        return jdbc.query(CONTRATOS+" where c.pedido_id=?",CONTRATO,pedido).stream().findFirst().orElse(null);
    }
    public Pagina<ContratoView> contratos(int pagina,int tamanho) {
        return Consultas.pagina(jdbc,CONTRATOS,"c.executado_em desc,c.id",CONTRATO,pagina,tamanho);
    }
    public ContratoView contrato(UUID id) {
        return jdbc.query(CONTRATOS+" where c.id=?",CONTRATO,id).stream().findFirst().orElseThrow(ApiException::naoEncontrado);
    }
    public UUID executar(ResumoPedido pedido) {
        return jdbc.queryForObject("""
            insert into allocar.contratos_aluguel(numero,pedido_id,parecer_aprovador_id,tipo,valor_total,proprietario_registrado_id)
            select ?,p.id,f.id,p.tipo_contrato,p.valor_total,a.proprietario_id
            from allocar.pedidos_aluguel p join allocar.clientes cl on cl.id=p.cliente_id
            join allocar.automoveis a on a.id=p.automovel_id
            join allocar.pareceres_financeiros f on f.pedido_id=p.id and f.versao_pedido=p.versao
                and f.versao_cadastro=cl.versao_cadastro and f.decisao='APROVADO'
            where p.id=? returning id
            """,UUID.class,"CT-"+UUID.randomUUID(),pedido.id());
    }
    public Pagina<CreditoView> creditos(int pagina,int tamanho) {
        return Consultas.pagina(jdbc,CREDITOS,"c.criado_em desc,c.id",CREDITO,pagina,tamanho);
    }
    public CreditoView credito(UUID id) {
        return jdbc.query(CREDITOS+" where c.id=?",CREDITO,id).stream().findFirst().orElseThrow(ApiException::naoEncontrado);
    }
    public UUID conceder(UUID banco,CreditoInput input) {
        return jdbc.queryForObject("insert into allocar.contratos_credito(numero,banco_concedente_id,valor,taxa) values (?,?,?,?) returning id",
            UUID.class,input.numero().strip(),banco,input.valor(),input.taxa());
    }
    public void associar(UUID contrato,UUID credito,UUID conta) {
        jdbc.update("insert into allocar.associacoes_credito(contrato_id,credito_id,conta_responsavel_id) values (?,?,?)",contrato,credito,conta);
    }
}
