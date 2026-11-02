package com.allocar.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.allocar.backend.application.BackendApplication;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcPrint;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Opt-in: mvn '-Dtest=SupabaseApiIT' test. Cada cenário termina em rollback. */
@SpringBootTest(classes=BackendApplication.class)
@AutoConfigureMockMvc(print=MockMvcPrint.NONE)
@ActiveProfiles("supabase")
@Transactional
class SupabaseApiIT {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    private final JsonMapper json=JsonMapper.builder().build();
    private static final String SENHA="AlloCar@Teste2026";
    private static final String EMPRESA="20000000-0000-0000-0000-000000000001";
    private static final String AUTO="60000000-0000-0000-0000-000000000001";
    private record Sessao(MockHttpSession http,String token) {}
    private record Cliente(String usuario,String id,Sessao sessao) {}
    private Sessao csrf(MockHttpSession session) throws Exception {
        var req=get("/api/auth/csrf"); if (session!=null) req.session(session);
        var result=mvc.perform(req).andExpect(status().isOk()).andReturn();
        return new Sessao((MockHttpSession)result.getRequest().getSession(),json.readTree(result.getResponse().getContentAsString()).get("token").asText());
    }
    private JsonNode chamar(MockHttpServletRequestBuilder req,Sessao sessao,int esperado) throws Exception {
        // No teste, várias requisições compartilham a transação externa de rollback.
        // Em execução normal, o próprio término da transação remove o contexto local.
        jdbc.queryForObject("select set_config('allocar.conta_id','',true)",String.class);
        var connection=org.springframework.jdbc.datasource.DataSourceUtils.getConnection(jdbc.getDataSource());
        var savepoint=connection.setSavepoint();
        var result=mvc.perform(req.session(sessao.http()).header("X-CSRF-TOKEN",sessao.token())).andReturn();
        String corpo=result.getResponse().getContentAsString();
        String diagnostico=corpo;
        if (result.getResolvedException()!=null) diagnostico+="; "+result.getResolvedException();
        if(result.getResponse().getStatus()>=400) connection.rollback(savepoint);
        connection.releaseSavepoint(savepoint);
        assertEquals(esperado,result.getResponse().getStatus(),diagnostico);
        return corpo.isBlank()?null:json.readTree(corpo);
    }
    private MockHttpServletRequestBuilder corpo(MockHttpServletRequestBuilder req,Object valor) {
        return req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(valor));
    }
    private Sessao login(String usuario) throws Exception {
        var inicial=csrf(null);
        chamar(corpo(post("/api/auth/login"),Map.of("usuario",usuario,"senha",SENHA)),inicial,200);
        return csrf(inicial.http());
    }
    private Map<String,Object> endereco() {
        return Map.of("logradouro","Rua de Teste","numero","10","bairro","Centro","cidade","São Paulo","uf","SP","cep","01000-000");
    }
    private Cliente cadastrar() throws Exception {
        String codigo=UUID.randomUUID().toString().replace("-","").substring(0,20);
        var entrada=Map.of("usuario","it_"+codigo,"senha",SENHA,"nome","Cliente integração","rg","RG-"+codigo,
            "cpf","IT-"+codigo,"profissao","Analista","endereco",endereco(),"vinculos",List.of());
        JsonNode criado=chamar(corpo(post("/api/clientes"),entrada),csrf(null),201);
        assertTrue(criado.get("ativa").asBoolean()); assertFalse(criado.has("senhaHash"));
        return new Cliente("it_"+codigo,criado.get("parteId").asText(),login("it_"+codigo));
    }
    private JsonNode criarPedido(Cliente cliente) throws Exception {
        return chamar(corpo(post("/api/pedidos"),Map.of("agenteResponsavelId",EMPRESA,"proposta",proposta(1250))),cliente.sessao(),201);
    }
    private Map<String,Object> proposta(int valor) {
        return Map.of("automovelId",AUTO,"inicio","2026-12-10","fim","2026-12-15","tipo","PADRAO","valorTotal",valor);
    }
    private JsonNode avaliar(String pedido,Sessao agente,long versao,long cadastro,String decisao) throws Exception {
        return chamar(corpo(post("/api/pedidos/"+pedido+"/pareceres"),Map.of("versaoPedido",versao,"versaoCadastro",cadastro,
            "decisao",decisao,"justificativa","Análise dos dados vigentes.")),agente,201);
    }

    @Test void cadastroLoginPedidoParecerContratoECreditoFuncionamComRlsERollback() throws Exception {
        var cliente=cadastrar(); var agente=login("hyper.empresa"); var banco=login("hyper.banco");
        var detalhes=criarPedido(cliente); String pedido=detalhes.get("pedido").get("id").asText();
        assertEquals("EM_ANALISE",detalhes.get("pedido").get("status").asText());
        assertEquals(cliente.id(),detalhes.get("pedido").get("clienteId").asText());
        var parecer=avaliar(pedido,agente,1,1,"APROVADO");
        assertEquals(1250,parecer.get("propostaAnalisada").get("valorTotal").asInt());
        var contrato=chamar(corpo(post("/api/pedidos/"+pedido+"/contrato"),Map.of("versao",1)),agente,201);
        var credito=chamar(corpo(post("/api/creditos"),Map.of("numero","IT-"+UUID.randomUUID(),"valor",1250,"taxa",0)),banco,201);
        String contratoId=contrato.get("id").asText(),creditoId=credito.get("id").asText();
        var associado=chamar(corpo(put("/api/contratos/"+contratoId+"/credito"),Map.of("creditoId",creditoId)),banco,200);
        assertEquals(creditoId,associado.get("creditoId").asText());
        chamar(corpo(put("/api/contratos/"+contratoId+"/credito"),Map.of("creditoId",creditoId)),banco,409);
        chamar(corpo(post("/api/pedidos/"+pedido+"/contrato"),Map.of("versao",1)),agente,422);
        assertEquals("EM_EXECUCAO",chamar(get("/api/pedidos/"+pedido),cliente.sessao(),200).get("pedido").get("status").asText());
        chamar(corpo(post("/api/pedidos/"+pedido+"/cancelamento"),Map.of("versao",1)),cliente.sessao(),422);
        assertEquals(contratoId,chamar(get("/api/contratos/"+contratoId),banco,200).get("id").asText());
        chamar(get("/api/creditos/"+creditoId),cliente.sessao(),200);
    }

    @Test void dadosDeOutrosClientesNaoSaoExpostosENaoHaAcessoFinanceiroPorCliente() throws Exception {
        var cliente=cadastrar(); var outro=cadastrar();
        String pedido=criarPedido(cliente).get("pedido").get("id").asText();
        chamar(get("/api/pedidos/"+pedido),outro.sessao(),404);
        assertEquals(0,chamar(get("/api/pedidos"),outro.sessao(),200).get("total").asInt());
        chamar(corpo(post("/api/pedidos/"+pedido+"/pareceres"),Map.of("versaoPedido",1,"versaoCadastro",1,
            "decisao","APROVADO","justificativa","Tentativa.")),cliente.sessao(),403);
        chamar(corpo(post("/api/creditos"),Map.of("numero","X","valor",100,"taxa",0)),cliente.sessao(),403);
        chamar(get("/api/pedidos/"+pedido),login("horizonte.empresa"),404);
        chamar(get("/api/automoveis?marca=Chevrolet&ano=2025"),cliente.sessao(),200);
        chamar(get("/api/automoveis?tamanho=0"),cliente.sessao(),400);
        chamar(post("/api/auth/logout"),cliente.sessao(),204);
        chamar(get("/api/auth/me"),cliente.sessao(),401);
    }

    @Test void alteracoesExigemVersaoAtualEInvalidamParecerSemReescreverHistorico() throws Exception {
        var cliente=cadastrar(); var agente=login("hyper.empresa");
        String pedido=criarPedido(cliente).get("pedido").get("id").asText();
        avaliar(pedido,agente,1,1,"APROVADO");
        var perfil=chamar(corpo(put("/api/clientes/me"),Map.of("versaoCadastro",1,"nome","Nome atualizado",
            "rg","RG-atualizado","cpf","IT-"+UUID.randomUUID().toString().substring(0,20),"profissao","Engenheiro","endereco",endereco())),cliente.sessao(),200);
        long cadastro=perfil.get("versaoCadastro").asLong(); assertTrue(cadastro>1);
        var detalhes=chamar(get("/api/pedidos/"+pedido),cliente.sessao(),200);
        assertEquals("EM_ANALISE",detalhes.get("pedido").get("status").asText());
        assertEquals("Cliente integração",detalhes.get("pareceres").get(0).get("dadosCliente").get("nome").asText());
        chamar(corpo(post("/api/pedidos/"+pedido+"/contrato"),Map.of("versao",1)),agente,422);
        chamar(corpo(post("/api/pedidos/"+pedido+"/pareceres"),Map.of("versaoPedido",1,"versaoCadastro",1,
            "decisao","APROVADO","justificativa","Cadastro antigo.")),agente,409);
        avaliar(pedido,agente,1,cadastro,"REPROVADO");
        var alterado=chamar(corpo(put("/api/pedidos/"+pedido),Map.of("versao",1,"proposta",proposta(1500))),cliente.sessao(),200);
        assertEquals(2,alterado.get("pedido").get("versao").asInt());
        chamar(corpo(post("/api/pedidos/"+pedido+"/cancelamento"),Map.of("versao",1)),cliente.sessao(),409);
        chamar(corpo(post("/api/pedidos/"+pedido+"/reenvio"),Map.of("versao",2)),cliente.sessao(),200);
        chamar(corpo(post("/api/pedidos/"+pedido+"/cancelamento"),Map.of("versao",3)),cliente.sessao(),200);
    }

    @Test void perfilPermiteTresVinculosEExclusaoLogicaPreservaPedido() throws Exception {
        var cliente=cadastrar(); String pedido=criarPedido(cliente).get("pedido").get("id").asText();
        JsonNode perfil=null; long versao=1;
        for(int i=0;i<3;i++) {
            perfil=chamar(corpo(post("/api/clientes/me/vinculos"),Map.of("versaoCadastro",versao,"empregador","Empresa "+i,"rendimento",1000)),cliente.sessao(),201);
            versao=perfil.get("versaoCadastro").asLong();
        }
        chamar(corpo(post("/api/clientes/me/vinculos"),Map.of("versaoCadastro",versao,"empregador","Quarto","rendimento",1000)),cliente.sessao(),422);
        String vinculo=perfil.get("vinculos").get(0).get("id").asText();
        perfil=chamar(corpo(put("/api/clientes/me/vinculos/"+vinculo),Map.of("versaoCadastro",versao,"empregador","Atualizada","rendimento",1500)),cliente.sessao(),200);
        versao=perfil.get("versaoCadastro").asLong();
        perfil=chamar(delete("/api/clientes/me/vinculos/"+vinculo+"?versaoCadastro="+versao),cliente.sessao(),200);
        versao=perfil.get("versaoCadastro").asLong(); assertEquals(2,perfil.get("vinculos").size());
        chamar(delete("/api/clientes/me?versaoCadastro="+versao),cliente.sessao(),204);
        chamar(get("/api/auth/me"),cliente.sessao(),401);
        var agente=login("hyper.empresa"); chamar(get("/api/pedidos/"+pedido),agente,200);
        chamar(corpo(post("/api/auth/login"),Map.of("usuario",cliente.usuario(),"senha",SENHA)),csrf(null),401);
    }

    @Test void instituicoesNovasNaoPodemAutovalidarOuEntrar() throws Exception {
        String codigo=UUID.randomUUID().toString().replace("-","").substring(0,20); var anon=csrf(null);
        Map<String,Object> entrada=new HashMap<>(Map.of("usuario","banco_"+codigo,"senha",SENHA,"nome","Banco de teste",
            "cnpj","IT-"+codigo,"tipo","BANCO","endereco",endereco()));
        var criado=chamar(corpo(post("/api/agentes"),entrada),anon,201); assertFalse(criado.get("ativa").asBoolean());
        chamar(corpo(post("/api/auth/login"),Map.of("usuario","banco_"+codigo,"senha",SENHA)),anon,401);
        chamar(corpo(post("/api/agentes"),entrada),anon,409);
        entrada.put("instituicaoValidada",true);
        chamar(corpo(post("/api/agentes"),entrada),anon,400);
    }
}
