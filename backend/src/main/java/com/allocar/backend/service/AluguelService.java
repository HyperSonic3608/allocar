package com.allocar.backend.service;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.exception.ApiException;
import com.allocar.backend.model.*;
import com.allocar.backend.repository.*;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@Profile("supabase")
public class AluguelService {
    private final ContextoBanco contexto;
    private final AutomovelRepository automoveis;
    private final PedidoRepository pedidos;
    private final ClienteRepository clientes;
    private final FinanceiroRepository financeiro;
    public AluguelService(ContextoBanco contexto,AutomovelRepository automoveis,PedidoRepository pedidos,
                          ClienteRepository clientes,FinanceiroRepository financeiro) {
        this.contexto=contexto; this.automoveis=automoveis; this.pedidos=pedidos;
        this.clientes=clientes; this.financeiro=financeiro;
    }
    public Pagina<VeiculoCatalogo> automoveis(ContaAutenticada conta,String marca,Integer ano,int pagina,int tamanho) {
        return contexto.comConta(conta.contaId(),()->automoveis.paginar(marca,ano,pagina,tamanho));
    }
    public VeiculoCatalogo automovel(ContaAutenticada conta,UUID id) {
        return contexto.comConta(conta.contaId(),()->automoveis.obter(id));
    }
    public Pagina<AgenteView> agentes(ContaAutenticada conta,int pagina,int tamanho) {
        return contexto.comConta(conta.contaId(),()->automoveis.agentes(pagina,tamanho));
    }
    public Pagina<ResumoPedido> pedidos(ContaAutenticada conta,StatusPedido status,int pagina,int tamanho) {
        return contexto.comConta(conta.contaId(),()->pedidos.paginar(status,pagina,tamanho));
    }
    public DetalhePedido pedido(ContaAutenticada conta,UUID id) {
        return contexto.comConta(conta.contaId(),()->detalhar(id));
    }
    public DetalhePedido criar(ContaAutenticada conta,CriarPedido input) {
        conta.exigirCliente(); return contexto.comConta(conta.contaId(),()->{
            clientes.bloquear(conta.parteId()); automoveis.obter(input.proposta().automovelId());
            return detalhar(pedidos.criar(conta.parteId(),input));
        });
    }
    public DetalhePedido alterar(ContaAutenticada conta,UUID id,AlterarPedido input) {
        return contexto.comConta(conta.contaId(),()->{
            bloquear(conta,id,input.versao(),false); automoveis.obter(input.proposta().automovelId());
            pedidos.alterar(id,input); return detalhar(id);
        });
    }
    public DetalhePedido reenviar(ContaAutenticada conta,UUID id,long versao) {
        return contexto.comConta(conta.contaId(),()->{
            bloquear(conta,id,versao,false); pedidos.reenviar(id); return detalhar(id);
        });
    }
    public DetalhePedido cancelar(ContaAutenticada conta,UUID id,long versao) {
        conta.exigirCliente(); return contexto.comConta(conta.contaId(),()->{
            var pedido=bloquear(conta,id,versao,false);
            if (!pedido.clienteId().equals(conta.parteId())) throw new AccessDeniedException("Somente o titular pode cancelar.");
            pedidos.cancelar(id); return detalhar(id);
        });
    }
    public List<ParecerView> pareceres(ContaAutenticada conta,UUID id) {
        return contexto.comConta(conta.contaId(),()->{ pedidos.obter(id); return financeiro.pareceres(id); });
    }
    public ParecerView avaliar(ContaAutenticada conta,UUID id,Avaliacao input) {
        conta.exigirAgente(); return contexto.comConta(conta.contaId(),()->{
            var pedido=bloquear(conta,id,input.versaoPedido(),true);
            if (pedido.status()!=StatusPedido.EM_ANALISE)
                throw new ApiException(422,"PEDIDO_FORA_DE_ANALISE","Somente pedidos em análise recebem parecer.");
            if (clientes.obter(pedido.clienteId()).versaoCadastro()!=input.versaoCadastro()) throw ApiException.conflito();
            return financeiro.avaliar(id,conta.parteId(),input);
        });
    }
    public ContratoView executar(ContaAutenticada conta,UUID id,long versao) {
        conta.exigirAgente(); return contexto.comConta(conta.contaId(),()->{
            var pedido=bloquear(conta,id,versao,true);
            long cadastro=clientes.obter(pedido.clienteId()).versaoCadastro();
            boolean aprovado=financeiro.pareceres(id).stream().anyMatch(p->p.decisao()==DecisaoParecer.APROVADO
                && p.versaoPedido()==pedido.versao() && p.versaoCadastro()==cadastro);
            if (pedido.status()!=StatusPedido.APROVADO || !aprovado)
                throw new ApiException(422,"APROVACAO_OBRIGATORIA","A execução exige aprovação financeira da proposta e do cadastro atuais.");
            return financeiro.contrato(financeiro.executar(pedido));
        });
    }
    public Pagina<ContratoView> contratos(ContaAutenticada conta,int pagina,int tamanho) {
        return contexto.comConta(conta.contaId(),()->financeiro.contratos(pagina,tamanho));
    }
    public ContratoView contrato(ContaAutenticada conta,UUID id) {
        return contexto.comConta(conta.contaId(),()->financeiro.contrato(id));
    }
    public Pagina<CreditoView> creditos(ContaAutenticada conta,int pagina,int tamanho) {
        return contexto.comConta(conta.contaId(),()->financeiro.creditos(pagina,tamanho));
    }
    public CreditoView credito(ContaAutenticada conta,UUID id) {
        return contexto.comConta(conta.contaId(),()->financeiro.credito(id));
    }
    public CreditoView conceder(ContaAutenticada conta,CreditoInput input) {
        conta.exigirBanco(); return contexto.comConta(conta.contaId(),()->financeiro.credito(financeiro.conceder(conta.parteId(),input)));
    }
    public ContratoView associar(ContaAutenticada conta,UUID contrato,UUID credito) {
        conta.exigirBanco(); return contexto.comConta(conta.contaId(),()->{
            if (!financeiro.credito(credito).bancoConcedenteId().equals(conta.parteId()))
                throw new AccessDeniedException("Associação exclusiva do banco concedente.");
            financeiro.associar(contrato,credito,conta.contaId()); return financeiro.contrato(contrato);
        });
    }
    private DetalhePedido detalhar(UUID id) {
        var pedido=pedidos.obter(id);
        return new DetalhePedido(pedido,automoveis.obter(pedido.automovelId()),clientes.obter(pedido.clienteId()),
            financeiro.pareceres(id),financeiro.contratoDoPedido(id));
    }
    /** Ordem global de bloqueios: cliente antes de pedido, inclusive nas alterações de proposta. */
    private ResumoPedido bloquear(ContaAutenticada conta,UUID id,long versao,boolean apenasAgente) {
        var anterior=pedidos.obter(id);
        boolean agente=anterior.agenteResponsavelId().equals(conta.parteId());
        if ((!agente && apenasAgente) || (!agente && !anterior.clienteId().equals(conta.parteId())))
            throw new AccessDeniedException("Pedido fora do escopo de alteração da conta.");
        clientes.bloquear(anterior.clienteId()); var atual=pedidos.bloquear(id);
        if (atual.versao()!=versao) throw ApiException.conflito();
        if (atual.status()==StatusPedido.CANCELADO || atual.status()==StatusPedido.EM_EXECUCAO)
            throw new ApiException(422,"ESTADO_TERMINAL","Pedidos cancelados ou em execução não podem ser alterados.");
        return atual;
    }
}
