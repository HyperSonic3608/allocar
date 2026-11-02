package com.allocar.backend.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Credenciais externas; esta classe não implementa toString para não divulgar senhas. */
@ConfigurationProperties("allocar.database")
public class DatabaseProperties {
    private String projectRef;
    private String url;
    private String username;
    private String password;
    private int maximumPoolSize = 5;

    public String usuarioRoteado(String usuario, String jdbcUrl) {
        if (jdbcUrl != null && jdbcUrl.contains(".pooler.supabase.com") && !usuario.contains(".")) {
            return usuario + "." + projectRef;
        }
        return usuario;
    }

    public static void exigir(String valor, String nome) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalStateException("Configure " + nome + " no ambiente ou em backend/.env.");
        }
    }

    public static void validarUrl(String url) {
        exigir(url, "SUPABASE_DB_URL");
        if (!url.startsWith("jdbc:postgresql://") || url.matches("(?i).*[?&](password|user)=.*")) {
            throw new IllegalStateException("Use uma URL JDBC PostgreSQL sem credenciais na própria URL.");
        }
        if (url.contains("supabase") && !url.matches(".*[?&]sslmode=(require|verify-ca|verify-full)(&.*)?")) {
            throw new IllegalStateException("A conexão Supabase exige SSL.");
        }
    }

    public String getProjectRef() { return projectRef; }
    public void setProjectRef(String value) { projectRef = value; }
    public String getUrl() { return url; }
    public void setUrl(String value) { url = value; }
    public String getUsername() { return username; }
    public void setUsername(String value) { username = value; }
    public String getPassword() { return password; }
    public void setPassword(String value) { password = value; }
    public int getMaximumPoolSize() { return maximumPoolSize; }
    public void setMaximumPoolSize(int value) { maximumPoolSize = value; }
}
