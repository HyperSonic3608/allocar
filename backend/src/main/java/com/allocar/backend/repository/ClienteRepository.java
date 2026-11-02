package com.allocar.backend.repository;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.exception.ApiException;
import com.allocar.backend.model.Endereco;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Profile("supabase")
public class ClienteRepository {
    private final JdbcTemplate jdbc;
    public ClienteRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }

    public long bloquear(UUID id) {
        return jdbc.query("select versao_cadastro from allocar.clientes where id=? for update",
            (rs,n)->rs.getLong(1),id).stream().findFirst().orElseThrow(ApiException::naoEncontrado);
    }

    public ClienteView obter(UUID id) {
        List<VinculoView> vinculos=jdbc.query("""
            select id,empregador,rendimento from allocar.vinculos_empregaticios where cliente_id=? order by id
            """,(rs,n)->new VinculoView(rs.getObject("id",UUID.class),rs.getString("empregador"),rs.getBigDecimal("rendimento")),id);
        return jdbc.query("""
            select c.*,p.nome,e.logradouro,e.numero,e.complemento,e.bairro,e.cidade,e.uf,e.cep
            from allocar.clientes c join allocar.partes p on p.id=c.id
            join allocar.enderecos e on e.id=p.endereco_id where c.id=?
            """,(rs,n)->new ClienteView(id,rs.getString("nome"),rs.getString("rg"),rs.getString("cpf"),
                rs.getString("profissao"),new Endereco(rs.getString("logradouro"),rs.getString("numero"),
                    rs.getString("complemento"),rs.getString("bairro"),rs.getString("cidade"),rs.getString("uf"),rs.getString("cep")),
                vinculos,vinculos.stream().map(VinculoView::rendimento).reduce(java.math.BigDecimal.ZERO,java.math.BigDecimal::add),
                rs.getLong("versao_cadastro")),id).stream().findFirst().orElseThrow(ApiException::naoEncontrado);
    }

    public void atualizar(UUID id,AtualizarCliente input) {
        var e=input.endereco().toEndereco();
        jdbc.update("""
            update allocar.enderecos set logradouro=?,numero=?,complemento=?,bairro=?,cidade=?,uf=?,cep=?
            where id=(select endereco_id from allocar.partes where id=?)
            """,e.logradouro(),e.numero(),e.complemento(),e.bairro(),e.cidade(),e.uf(),e.cep(),id);
        jdbc.update("update allocar.partes set nome=? where id=?",input.nome().strip(),id);
        jdbc.update("update allocar.clientes set rg=?,cpf=?,profissao=? where id=?",
            input.rg().strip(),input.cpf().strip(),input.profissao().strip(),id);
    }

    public UUID adicionarVinculo(UUID cliente,ManterVinculo input) {
        return jdbc.queryForObject("""
            insert into allocar.vinculos_empregaticios(cliente_id,empregador,rendimento) values (?,?,?) returning id
            """,UUID.class,cliente,input.empregador().strip(),input.rendimento());
    }
    public void atualizarVinculo(UUID cliente,UUID vinculo,ManterVinculo input) {
        if (jdbc.update("update allocar.vinculos_empregaticios set empregador=?,rendimento=? where cliente_id=? and id=?",
            input.empregador().strip(),input.rendimento(),cliente,vinculo)!=1) throw ApiException.naoEncontrado();
    }
    public void removerVinculo(UUID cliente,UUID vinculo) {
        if (jdbc.update("delete from allocar.vinculos_empregaticios where cliente_id=? and id=?",cliente,vinculo)!=1)
            throw ApiException.naoEncontrado();
    }
}
