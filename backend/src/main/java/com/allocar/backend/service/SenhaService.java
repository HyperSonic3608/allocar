package com.allocar.backend.service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/** Compatível com os hashes PBKDF2 dos cadastros AlloCar. */
@Service
public class SenhaService implements PasswordEncoder {
    private static final int ITERACOES=310_000;
    private final SecureRandom random=new SecureRandom();
    private final String hashInexistente;

    public SenhaService() { hashInexistente=encode("credencial-inexistente-"+random.nextLong()); }

    @Override public String encode(CharSequence senha) {
        byte[] salt=new byte[16]; random.nextBytes(salt);
        return "pbkdf2-sha256$"+ITERACOES+"$"+Base64.getEncoder().encodeToString(salt)+"$"
            +Base64.getEncoder().encodeToString(derivar(senha,salt,ITERACOES));
    }

    @Override public boolean matches(CharSequence senha, String hash) {
        if (senha==null || senha.length()>256) return false;
        if (hash==null) { matches(senha,hashInexistente); return false; }
        try {
            String[] partes=hash.split("\\$",-1);
            if (partes.length!=4 || !"pbkdf2-sha256".equals(partes[0])) return false;
            int iteracoes=Integer.parseInt(partes[1]);
            if (iteracoes<100_000 || iteracoes>1_000_000) return false;
            byte[] salt=Base64.getDecoder().decode(partes[2]);
            byte[] esperado=Base64.getDecoder().decode(partes[3]);
            return salt.length>=16 && salt.length<=64 && esperado.length==32
                && MessageDigest.isEqual(esperado,derivar(senha,salt,iteracoes));
        } catch (IllegalArgumentException ex) { return false; }
    }

    private static byte[] derivar(CharSequence senha, byte[] salt, int iteracoes) {
        char[] caracteres=senha.toString().toCharArray();
        var spec=new PBEKeySpec(caracteres,salt,iteracoes,256);
        Arrays.fill(caracteres,'\0');
        try { return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); }
        catch (java.security.GeneralSecurityException ex) { throw new IllegalStateException("PBKDF2 indisponível.",ex); }
        finally { spec.clearPassword(); }
    }
}
