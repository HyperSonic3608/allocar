package com.allocar.backend.controller;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.model.VeiculoCatalogo;
import com.allocar.backend.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Profile("supabase")
public class CatalogoController {
    private final AluguelService service;
    private final AutenticacaoService auth;
    public CatalogoController(AluguelService service,AutenticacaoService auth) { this.service=service; this.auth=auth; }
    @GetMapping("/automoveis")
    public Pagina<VeiculoCatalogo> automoveis(@AuthenticationPrincipal ContaAutenticada conta,
        @RequestParam(required=false) @Size(max=100) String marca,@RequestParam(required=false) @Min(1) @Max(9999) Integer ano,
        @RequestParam(defaultValue="0") @Min(0) @Max(1000000) int pagina,@RequestParam(defaultValue="20") @Min(1) @Max(100) int tamanho) {
        return service.automoveis(conta,marca,ano,pagina,tamanho);
    }
    @GetMapping("/automoveis/{id}")
    public VeiculoCatalogo automovel(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id) { return service.automovel(conta,id); }
    @GetMapping("/agentes")
    public Pagina<AgenteView> agentes(@AuthenticationPrincipal ContaAutenticada conta,
        @RequestParam(defaultValue="0") @Min(0) @Max(1000000) int pagina,@RequestParam(defaultValue="20") @Min(1) @Max(100) int tamanho) { return service.agentes(conta,pagina,tamanho); }
    @PostMapping("/agentes")
    public ResponseEntity<CadastroCriado> cadastrarAgente(@Valid @RequestBody CadastroAgente input) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.cadastrarAgente(input));
    }
}
