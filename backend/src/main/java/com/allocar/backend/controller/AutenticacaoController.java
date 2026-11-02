package com.allocar.backend.controller;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.service.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Profile("supabase")
public class AutenticacaoController {
    private final AuthenticationManager manager;
    private final SessionAuthenticationStrategy strategy;
    private final SecurityContextRepository repository;
    private final AutenticacaoService service;
    public AutenticacaoController(AuthenticationManager manager,SessionAuthenticationStrategy strategy,
        SecurityContextRepository repository,AutenticacaoService service) {
        this.manager=manager; this.strategy=strategy; this.repository=repository; this.service=service;
    }
    @GetMapping("/csrf")
    public Map<String,String> csrf(CsrfToken csrf) { return Map.of("token",csrf.getToken(),"headerName",csrf.getHeaderName()); }

    @PostMapping("/login")
    public ContaPublica login(@Valid @RequestBody Login input,HttpServletRequest request,HttpServletResponse response) {
        var authentication=manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(input.usuario(),input.senha()));
        strategy.onAuthentication(authentication,request,response);
        var context=SecurityContextHolder.createEmptyContext(); context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context); repository.saveContext(context,request,response);
        var conta=(ContaAutenticada)authentication.getPrincipal();
        return new ContaPublica(conta.contaId(),conta.parteId(),conta.usuario(),conta.nome(),conta.tipo());
    }
    @GetMapping("/me")
    public ContaPublica atual(@AuthenticationPrincipal ContaAutenticada conta) { return service.atual(conta); }
}
