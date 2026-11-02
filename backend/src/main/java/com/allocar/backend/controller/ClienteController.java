package com.allocar.backend.controller;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.service.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
@Profile("supabase")
public class ClienteController {
    private final ClienteService service;
    private final AutenticacaoService auth;
    public ClienteController(ClienteService service,AutenticacaoService auth) { this.service=service; this.auth=auth; }
    @PostMapping
    public ResponseEntity<CadastroCriado> cadastrar(@Valid @RequestBody CadastroCliente input) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.cadastrarCliente(input));
    }
    @GetMapping("/me")
    public ClienteView obter(@AuthenticationPrincipal ContaAutenticada conta) { return service.obter(conta); }
    @PutMapping("/me")
    public ClienteView atualizar(@AuthenticationPrincipal ContaAutenticada conta,@Valid @RequestBody AtualizarCliente input) {
        return service.atualizar(conta,input);
    }
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@AuthenticationPrincipal ContaAutenticada conta,@RequestParam @Positive long versaoCadastro,
                         HttpServletRequest request,HttpServletResponse response) {
        service.desativar(conta,versaoCadastro); new SecurityContextLogoutHandler().logout(request,response,null);
    }
    @PostMapping("/me/vinculos")
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteView adicionar(@AuthenticationPrincipal ContaAutenticada conta,@Valid @RequestBody ManterVinculo input) {
        return service.adicionarVinculo(conta,input);
    }
    @PutMapping("/me/vinculos/{id}")
    public ClienteView atualizarVinculo(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id,
                                      @Valid @RequestBody ManterVinculo input) { return service.atualizarVinculo(conta,id,input); }
    @DeleteMapping("/me/vinculos/{id}")
    public ClienteView remover(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id,
                              @RequestParam @Positive long versaoCadastro) { return service.removerVinculo(conta,id,versaoCadastro); }
}
