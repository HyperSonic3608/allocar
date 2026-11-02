package com.allocar.backend.service;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.repository.ContaRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@Profile("supabase")
public class AutenticacaoService implements AuthenticationProvider {
    private final ContaRepository contas;
    private final SenhaService senhas;
    private final ContextoBanco contexto;
    private final TransactionTemplate transactions;
    public AutenticacaoService(ContaRepository contas, SenhaService senhas, ContextoBanco contexto,
                              TransactionTemplate transactions) {
        this.contas=contas; this.senhas=senhas; this.contexto=contexto; this.transactions=transactions;
    }

    @Override public Authentication authenticate(Authentication authentication) {
        var credencial=contas.credencial(authentication.getName()).orElse(null);
        boolean correta=senhas.matches((CharSequence)authentication.getCredentials(),
            credencial==null?null:credencial.hash());
        if (!correta || credencial==null || !credencial.habilitada()) {
            throw new BadCredentialsException("Usuário ou senha inválidos.");
        }
        return UsernamePasswordAuthenticationToken.authenticated(credencial.conta(),null,
            List.of(new SimpleGrantedAuthority("ROLE_"+credencial.conta().tipo())));
    }

    @Override public boolean supports(Class<?> tipo) { return UsernamePasswordAuthenticationToken.class.isAssignableFrom(tipo); }

    public ContaPublica atual(ContaAutenticada conta) {
        return contexto.comConta(conta.contaId(),()->contas.atual(conta.contaId()));
    }

    public CadastroCriado cadastrarCliente(CadastroCliente input) {
        var dados=base(input.usuario(),input.nome(),input.endereco());
        dados.put("rg",input.rg()); dados.put("cpf",input.cpf()); dados.put("profissao",input.profissao());
        dados.put("vinculos",input.vinculos());
        String hash=senhas.encode(input.senha());
        return transactions.execute(status->contas.registrar("CLIENTE",dados,hash));
    }

    public CadastroCriado cadastrarAgente(CadastroAgente input) {
        var dados=base(input.usuario(),input.nome(),input.endereco()); dados.put("cnpj",input.cnpj());
        String hash=senhas.encode(input.senha());
        return transactions.execute(status->contas.registrar(input.tipo().name(),dados,hash));
    }

    private Map<String,Object> base(String usuario,String nome,EnderecoInput endereco) {
        var dados=new HashMap<String,Object>(); dados.put("usuario",usuario); dados.put("nome",nome);
        dados.put("endereco",endereco.toEndereco()); return dados;
    }
}
