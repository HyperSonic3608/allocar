package com.allocar.backend.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.allocar.backend.application.BackendApplication;
import com.allocar.backend.exception.ApiException;
import com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.service.*;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers={HealthController.class,AutenticacaoController.class,ClienteController.class,CatalogoController.class,PedidoController.class,FinanceiroController.class})
@ContextConfiguration(classes=BackendApplication.class)
@Import(SegurancaConfiguration.class)
@ActiveProfiles("supabase")
class ApiRestTests {
    @Autowired MockMvc mvc;
    @Test void healthPublicoNaoCriaSessaoNemExpoeDados() throws Exception {
        var result=mvc.perform(get("/api/health")).andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP")).andReturn();
        org.junit.jupiter.api.Assertions.assertNull(result.getRequest().getSession(false));
        verifyNoInteractions(auth,clientes,alugueis);
    }
    @MockitoBean AutenticacaoService auth;
    @MockitoBean ClienteService clientes;
    @MockitoBean AluguelService alugueis;
    private final ContaAutenticada conta=new ContaAutenticada(UUID.randomUUID(),UUID.randomUUID(),"teste","Cliente","CLIENTE");
    private org.springframework.test.web.servlet.request.RequestPostProcessor autenticado() {
        return authentication(UsernamePasswordAuthenticationToken.authenticated(conta,null,List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"))));
    }
    @Test void acessoSemSessaoRetornaJson401() throws Exception {
        mvc.perform(get("/api/pedidos")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"));
        verifyNoInteractions(alugueis);
    }
    @Test void csrfEObrigatorioInclusiveNoLogin() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"usuario\":\"ana\",\"senha\":\"qualquer\"}"))
            .andExpect(status().isForbidden()).andExpect(jsonPath("$.codigo").value("ACESSO_NEGADO"));
        verifyNoInteractions(auth);
    }
    @Test void csrfPodeSerObtidoSemAutenticacao() throws Exception {
        mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"));
    }
    @Test void principalDaSessaoEUsadoNaConsulta() throws Exception {
        when(alugueis.pedidos(eq(conta),isNull(),eq(0),eq(20))).thenReturn(new Pagina<>(List.of(),0,20,0));
        mvc.perform(get("/api/pedidos").with(autenticado())).andExpect(status().isOk()).andExpect(jsonPath("$.itens").isArray())
            .andExpect(jsonPath("$.total").value(0));
        verify(alugueis).pedidos(conta,null,0,20);
    }
    @Test void camposDeIdentidadeExtrasSaoRecusados() throws Exception {
        mvc.perform(post("/api/pedidos").with(autenticado()).with(csrf()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"contaId\":\""+UUID.randomUUID()+"\",\"agenteResponsavelId\":\""+UUID.randomUUID()+"\"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
        verifyNoInteractions(alugueis);
    }
    @Test void propostaInvalidaRetornaErrosDeCampoSemPersistir() throws Exception {
        String corpo="""
            {"agenteResponsavelId":"%s","proposta":{"automovelId":"%s","inicio":"2026-12-15",
             "fim":"2026-12-10","tipo":"PADRAO","valorTotal":0}}
            """.formatted(UUID.randomUUID(),UUID.randomUUID());
        mvc.perform(post("/api/pedidos").with(autenticado()).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(corpo))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.codigo").value("DADOS_INVALIDOS"))
            .andExpect(jsonPath("$.campos['proposta.valorTotal']").exists());
        verifyNoInteractions(alugueis);
    }
    @Test void versaoAusenteERejeitada() throws Exception {
        mvc.perform(post("/api/pedidos/"+UUID.randomUUID()+"/cancelamento").with(autenticado()).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isBadRequest());
        verifyNoInteractions(alugueis);
    }
    @Test void conflitoTemRespostaEstavel() throws Exception {
        UUID id=UUID.randomUUID(); when(alugueis.cancelar(conta,id,1)).thenThrow(ApiException.conflito());
        mvc.perform(post("/api/pedidos/"+id+"/cancelamento").with(autenticado()).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("{\"versao\":1}"))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.codigo").value("VERSAO_DESATUALIZADA"));
    }
    @Test void corsAutorizaApenasOrigensConfiguradas() throws Exception {
        mvc.perform(options("/api/pedidos").header("Origin","http://localhost:5173")
            .header("Access-Control-Request-Method","POST").header("Access-Control-Request-Headers","Content-Type,X-CSRF-TOKEN"))
            .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin","http://localhost:5173"))
            .andExpect(header().string("Access-Control-Allow-Credentials","true"));
        mvc.perform(options("/api/pedidos").header("Origin","https://origem-invalida.example")
            .header("Access-Control-Request-Method","POST")).andExpect(status().isForbidden());
    }
    @Test void uuidInvalidoRetorna400() throws Exception {
        mvc.perform(get("/api/pedidos/id-invalido").with(autenticado())).andExpect(status().isBadRequest());
    }
}
