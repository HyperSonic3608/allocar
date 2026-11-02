package com.allocar.backend.service;

import com.allocar.backend.model.ApiDtos.ErroApi;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.*;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.*;
import org.springframework.web.cors.*;
import tools.jackson.databind.json.JsonMapper;

@Configuration(proxyBeanMethods=false)
@EnableWebSecurity
@Profile("supabase")
@ConditionalOnWebApplication(type=ConditionalOnWebApplication.Type.SERVLET)
public class SegurancaConfiguration {
    @Bean AuthenticationManager authenticationManager(AutenticacaoService service) { return new ProviderManager(service); }
    @Bean SecurityContextRepository securityContextRepository() { return new HttpSessionSecurityContextRepository(); }
    @Bean CsrfTokenRepository csrfTokenRepository() { return new HttpSessionCsrfTokenRepository(); }
    @Bean SessionAuthenticationStrategy sessionAuthenticationStrategy(CsrfTokenRepository csrf) {
        return new CompositeSessionAuthenticationStrategy(List.of(
            new ChangeSessionIdAuthenticationStrategy(),new CsrfAuthenticationStrategy(csrf)));
    }
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository repository,
                                                CsrfTokenRepository csrf) throws Exception {
        return http.cors(Customizer.withDefaults())
            .csrf(config->config.csrfTokenRepository(csrf))
            .securityContext(config->config.securityContextRepository(repository))
            .authorizeHttpRequests(auth->auth
                .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/auth/csrf").permitAll()
                .requestMatchers(HttpMethod.POST,"/api/auth/login","/api/clientes","/api/agentes").permitAll()
                .requestMatchers("/api/clientes/me","/api/clientes/me/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.POST,"/api/pedidos","/api/pedidos/*/cancelamento").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.POST,"/api/pedidos/*/pareceres","/api/pedidos/*/contrato").hasAnyRole("EMPRESA","BANCO")
                .requestMatchers(HttpMethod.POST,"/api/creditos").hasRole("BANCO")
                .requestMatchers(HttpMethod.PUT,"/api/contratos/*/credito").hasRole("BANCO")
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated())
            .exceptionHandling(errors->errors
                .authenticationEntryPoint((req,res,ex)->erro(res,401,"NAO_AUTENTICADO","Autenticação obrigatória."))
                .accessDeniedHandler((req,res,ex)->erro(res,403,"ACESSO_NEGADO","Acesso negado ou token CSRF inválido.")))
            .logout(logout->logout.logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((req,res,auth)->res.setStatus(204)))
            .formLogin(AbstractHttpConfigurer::disable).httpBasic(AbstractHttpConfigurer::disable)
            .requestCache(AbstractHttpConfigurer::disable).build();
    }
    @Bean CorsConfigurationSource corsConfigurationSource(@Value("${allocar.api.allowed-origins}") String origens) {
        var cors=new CorsConfiguration();
        cors.setAllowedOrigins(Arrays.stream(origens.split(",")).map(String::trim).filter(s->!s.isEmpty()).toList());
        cors.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        cors.setAllowedHeaders(List.of("Content-Type","X-CSRF-TOKEN"));
        cors.setExposedHeaders(List.of("Location")); cors.setAllowCredentials(true); cors.setMaxAge(3600L);
        var source=new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/api/**",cors); return source;
    }
    public static void erro(HttpServletResponse response,int status,String codigo,String mensagem) throws IOException {
        response.setStatus(status); response.setContentType("application/json"); response.setCharacterEncoding("UTF-8");
        response.getWriter().write(JsonMapper.builder().build().writeValueAsString(new ErroApi(status,codigo,mensagem,Map.of())));
    }
}
