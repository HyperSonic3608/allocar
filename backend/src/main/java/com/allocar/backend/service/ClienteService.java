package com.allocar.backend.service;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.exception.ApiException;
import com.allocar.backend.repository.ClienteRepository;
import com.allocar.backend.repository.ContaRepository;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("supabase")
public class ClienteService {
    private final ContextoBanco contexto;
    private final ClienteRepository clientes;
    private final ContaRepository contas;
    public ClienteService(ContextoBanco contexto,ClienteRepository clientes,ContaRepository contas) {
        this.contexto=contexto; this.clientes=clientes; this.contas=contas;
    }
    public ClienteView obter(ContaAutenticada conta) {
        conta.exigirCliente(); return contexto.comConta(conta.contaId(),()->clientes.obter(conta.parteId()));
    }
    public ClienteView atualizar(ContaAutenticada conta,AtualizarCliente input) {
        conta.exigirCliente(); return contexto.comConta(conta.contaId(),()->{
            conferir(conta.parteId(),input.versaoCadastro()); clientes.atualizar(conta.parteId(),input);
            return clientes.obter(conta.parteId());
        });
    }
    public ClienteView adicionarVinculo(ContaAutenticada conta,ManterVinculo input) {
        conta.exigirCliente(); return contexto.comConta(conta.contaId(),()->{
            conferir(conta.parteId(),input.versaoCadastro());
            if (clientes.obter(conta.parteId()).vinculos().size()>=3)
                throw new ApiException(422,"LIMITE_VINCULOS","O cliente pode ter até três vínculos empregatícios.");
            clientes.adicionarVinculo(conta.parteId(),input); return clientes.obter(conta.parteId());
        });
    }
    public ClienteView atualizarVinculo(ContaAutenticada conta,UUID vinculo,ManterVinculo input) {
        conta.exigirCliente(); return contexto.comConta(conta.contaId(),()->{
            conferir(conta.parteId(),input.versaoCadastro()); clientes.atualizarVinculo(conta.parteId(),vinculo,input);
            return clientes.obter(conta.parteId());
        });
    }
    public ClienteView removerVinculo(ContaAutenticada conta,UUID vinculo,long versao) {
        conta.exigirCliente(); return contexto.comConta(conta.contaId(),()->{
            conferir(conta.parteId(),versao); clientes.removerVinculo(conta.parteId(),vinculo);
            return clientes.obter(conta.parteId());
        });
    }
    public void desativar(ContaAutenticada conta,long versao) {
        conta.exigirCliente(); contexto.comConta(conta.contaId(),()->{
            conferir(conta.parteId(),versao); contas.desativar(conta.contaId()); return null;
        });
    }
    private void conferir(UUID id,long versao) { if (clientes.bloquear(id)!=versao) throw ApiException.conflito(); }
}
