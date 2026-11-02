package com.allocar.backend.controller;

import static com.allocar.backend.model.ApiDtos.*;
import com.allocar.backend.model.*;
import com.allocar.backend.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
@Profile("supabase")
public class PedidoController {
    private final AluguelService service;
    public PedidoController(AluguelService service) { this.service=service; }
    @GetMapping
    public Pagina<ResumoPedido> listar(@AuthenticationPrincipal ContaAutenticada conta,
        @RequestParam(required=false) StatusPedido status,@RequestParam(defaultValue="0") @Min(0) @Max(1000000) int pagina,
        @RequestParam(defaultValue="20") @Min(1) @Max(100) int tamanho) { return service.pedidos(conta,status,pagina,tamanho); }
    @GetMapping("/{id}")
    public DetalhePedido obter(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id) { return service.pedido(conta,id); }
    @PostMapping
    public ResponseEntity<DetalhePedido> criar(@AuthenticationPrincipal ContaAutenticada conta,@Valid @RequestBody CriarPedido input) {
        var resultado=service.criar(conta,input);
        return ResponseEntity.created(URI.create("/api/pedidos/"+resultado.pedido().id())).body(resultado);
    }
    @PutMapping("/{id}")
    public DetalhePedido alterar(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id,
                                @Valid @RequestBody AlterarPedido input) { return service.alterar(conta,id,input); }
    @PostMapping("/{id}/reenvio")
    public DetalhePedido reenviar(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id,
                                 @Valid @RequestBody Versao input) { return service.reenviar(conta,id,input.versao()); }
    @PostMapping("/{id}/cancelamento")
    public DetalhePedido cancelar(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id,
                                 @Valid @RequestBody Versao input) { return service.cancelar(conta,id,input.versao()); }
    @GetMapping("/{id}/pareceres")
    public List<ParecerView> pareceres(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id) { return service.pareceres(conta,id); }
    @PostMapping("/{id}/pareceres")
    @ResponseStatus(HttpStatus.CREATED)
    public ParecerView avaliar(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id,
                               @Valid @RequestBody Avaliacao input) { return service.avaliar(conta,id,input); }
    @PostMapping("/{id}/contrato")
    public ResponseEntity<ContratoView> executar(@AuthenticationPrincipal ContaAutenticada conta,@PathVariable UUID id,
                                                @Valid @RequestBody Versao input) {
        var contrato=service.executar(conta,id,input.versao());
        return ResponseEntity.created(URI.create("/api/contratos/"+contrato.id())).body(contrato);
    }
}
