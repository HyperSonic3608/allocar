package com.allocar.backend.service;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration(proxyBeanMethods = false)
@Profile("supabase")
@EnableConfigurationProperties(DatabaseProperties.class)
public class SupabaseDatabaseConfiguration {

    @Bean(destroyMethod = "close")
    HikariDataSource dataSource(DatabaseProperties properties) {
        DatabaseProperties.validarUrl(properties.getUrl());
        DatabaseProperties.exigir(properties.getPassword(), "SUPABASE_DB_PASSWORD");
        DatabaseProperties.exigir(properties.getUsername(), "SUPABASE_DB_USERNAME");
        if (properties.getMaximumPoolSize() < 1 || properties.getMaximumPoolSize() > 20) {
            throw new IllegalStateException("O pool JDBC deve ter entre 1 e 20 conexões.");
        }
        var config = new HikariConfig();
        config.setJdbcUrl(properties.getUrl());
        config.setUsername(properties.usuarioRoteado(properties.getUsername(), properties.getUrl()));
        config.setPassword(properties.getPassword());
        config.setDriverClassName("org.postgresql.Driver");
        config.setPoolName("AlloCar-Supabase");
        config.setSchema("allocar");
        config.setMaximumPoolSize(properties.getMaximumPoolSize());
        config.setMinimumIdle(1);
        config.setConnectionTimeout(10_000);
        config.setValidationTimeout(3_000);
        config.setInitializationFailTimeout(10_000);
        return new HikariDataSource(config);
    }

    @Bean
    JdbcTemplate jdbcTemplate(DataSource dataSource) { return new JdbcTemplate(dataSource); }

    @Bean
    JdbcTransactionManager transactionManager(DataSource dataSource) { return new JdbcTransactionManager(dataSource); }

    @Bean
    TransactionTemplate transactionTemplate(JdbcTransactionManager manager) { return new TransactionTemplate(manager); }

    @Bean
    ApplicationRunner validarConexao(JdbcTemplate jdbc) {
        return args -> {
            Boolean seguro = jdbc.queryForObject("""
                select not r.rolsuper and not r.rolbypassrls
                  and pg_has_role(current_user, 'allocar_backend', 'member')
                  and to_regclass('allocar.pedidos_aluguel') is not null
                  and to_regprocedure('allocar.credencial_login(text)') is not null
                  and to_regprocedure('allocar.registrar_conta(text,jsonb,text)') is not null
                from pg_roles r where r.rolname = current_user
                """, Boolean.class);
            if (!Boolean.TRUE.equals(seguro)) {
                throw new IllegalStateException("Use o usuário dedicado do AlloCar e verifique as tabelas no Supabase.");
            }
        };
    }
}
