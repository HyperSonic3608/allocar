package com.allocar.backend.controller;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Profile("supabase")
public class FinanceiroController {
    private final AluguelService service;
    public FinanceiroController(AluguelService service) { this.service=service; }
    @GetMapping("/contratos")
    public Pagina<ContratoView> contratos(@AuthenticationPrincipal ContaAutenticada conta,
        @RequestParam(defaultValue="0") @Min(0) @Max(1000000) int pagina,@RequestParam(defaultValue="20") @Min(1) @Max(100) int tamanho) { return service.contratos(conta,pagina,tamanho); }
    @GetMapping("/contratos/{id}")
    public ContratoView contrato(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id) { return service.contrato(conta,id); }
    @PutMapping("/contratos/{id}/credito")
    public ContratoView associar(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id,
                                @Valid @RequestBody AssociarCredito input) { return service.associar(conta,id,input.creditoId()); }
    @GetMapping("/creditos")
    public Pagina<CreditoView> creditos(@AuthenticationPrincipal ContaAutenticada conta,
        @RequestParam(defaultValue="0") @Min(0) @Max(1000000) int pagina,@RequestParam(defaultValue="20") @Min(1) @Max(100) int tamanho) { return service.creditos(conta,pagina,tamanho); }
    @GetMapping("/creditos/{id}")
    public CreditoView credito(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id) { return service.credito(conta,id); }
    @PostMapping("/creditos")
    public ResponseEntity<CreditoView> conceder(@AuthenticationPrincipal ContaAutenticada conta,@Valid @RequestBody CreditoInput input) {
        var credito=service.conceder(conta,input);
        return ResponseEntity.created(URI.create("/api/creditos/"+credito.id())).body(credito);
    }
}
