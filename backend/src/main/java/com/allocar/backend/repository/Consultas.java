package com.allocar.backend.repository;

import com.allocar.backend.exception.ApiException;
import com.allocar.backend.model.ApiDtos.Pagina;
import java.util.ArrayList;
import java.util.Arrays;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

final class Consultas {
    private Consultas() {}
    /** SQL e ordenação são constantes dos repositórios; valores externos são parâmetros. */
    static <T> Pagina<T> pagina(JdbcTemplate jdbc,String sql,String ordem,RowMapper<T> mapper,
                               int pagina,int tamanho,Object... parametros) {
        if (pagina<0 || tamanho<1 || tamanho>100 || pagina>1_000_000) {
            throw new ApiException(400,"PAGINACAO_INVALIDA","Informe página entre 0 e 1000000 e tamanho entre 1 e 100.");
        }
        long total=jdbc.queryForObject("select count(*) from ("+sql+") dados",Long.class,parametros);
        var args=new ArrayList<>(Arrays.asList(parametros)); args.add(tamanho); args.add((long)pagina*tamanho);
        return new Pagina<>(jdbc.query(sql+" order by "+ordem+" limit ? offset ?",mapper,args.toArray()),pagina,tamanho,total);
    }
}
