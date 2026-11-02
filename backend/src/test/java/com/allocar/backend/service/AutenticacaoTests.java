package com.allocar.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.allocar.backend.repository.ContaRepository;
import com.allocar.backend.repository.ContaRepository.Credencial;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.*;
import org.springframework.transaction.support.TransactionTemplate;

class AutenticacaoTests {
    private final SenhaService senhas=new SenhaService();
    @Test void hashesUsamSaltAleatorioENaoAceitamSenhaIncorreta() {
        String um=senhas.encode("SenhaForte@Teste2026"),dois=senhas.encode("SenhaForte@Teste2026");
        assertNotEquals(um,dois); assertTrue(senhas.matches("SenhaForte@Teste2026",um));
        assertFalse(senhas.matches("outra-senha",um)); assertFalse(senhas.matches("senha","hash-malformado"));
    }
    @Test void loginNaoTransportaSenhaOuHashNoPrincipalOuCredenciais() {
        var repo=mock(ContaRepository.class);
        var conta=new ContaAutenticada(UUID.randomUUID(),UUID.randomUUID(),"ana","Ana","CLIENTE");
        when(repo.credencial("ana")).thenReturn(Optional.of(new Credencial(conta,senhas.encode("AlloCar@Teste2026"),true)));
        var auth=new AutenticacaoService(repo,senhas,mock(ContextoBanco.class),mock(TransactionTemplate.class));
        var resultado=auth.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("ana","AlloCar@Teste2026"));
        assertEquals(conta,resultado.getPrincipal()); assertNull(resultado.getCredentials());
        assertTrue(resultado.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_CLIENTE")));
    }
    @Test void contaInexistenteInativaOuSenhaErradaProduzemOMesmoErro() {
        var repo=mock(ContaRepository.class);
        var conta=new ContaAutenticada(UUID.randomUUID(),UUID.randomUUID(),"ana","Ana","CLIENTE");
        when(repo.credencial("inexistente")).thenReturn(Optional.empty());
        when(repo.credencial("inativa")).thenReturn(Optional.of(new Credencial(conta,senhas.encode("AlloCar@Teste2026"),false)));
        when(repo.credencial("ana")).thenReturn(Optional.of(new Credencial(conta,senhas.encode("outra"),true)));
        var auth=new AutenticacaoService(repo,senhas,mock(ContextoBanco.class),mock(TransactionTemplate.class));
        for(String usuario:new String[]{"inexistente","inativa","ana"}) {
            var erro=assertThrows(BadCredentialsException.class,()->auth.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(usuario,"AlloCar@Teste2026")));
            assertEquals("Usuário ou senha inválidos.",erro.getMessage());
        }
    }
}
