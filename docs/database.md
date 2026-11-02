# AlloCar — Banco de dados

## Organização

O PostgreSQL armazena os dados no schema privado `allocar`. O backend acessa esse schema por JDBC; as tabelas não concedem acesso aos papéis `anon`, `authenticated` e `service_role` da Data API. Contas do AlloCar são independentes de `auth.users`.

| Tabelas | Conteúdo |
| --- | --- |
| `enderecos`, `partes` | Endereço, identificação e especialização cliente/empresa/banco. |
| `clientes`, `vinculos_empregaticios` | Documentos, profissão, versão cadastral e até três rendimentos. |
| `agentes`, `empresas`, `bancos` | CNPJ e validação institucional. |
| `contas` | Usuário único, hash da senha, titular único e ativação. |
| `automoveis` | Matrícula, placa, ano, marca, modelo e proprietário. |
| `pedidos_aluguel` | Cliente, agente responsável, proposta, estado e versão. |
| `pareceres_financeiros` | Decisão justificada e cópias dos dados/proposta avaliados. |
| `contratos_aluguel` | Execução única, parecer vigente e condições aprovadas. |
| `contratos_credito`, `associacoes_credito` | Concessão por banco e associação exclusiva ao aluguel. |

As tabelas possuem índices nas chaves estrangeiras, restrições, triggers e políticas RLS. CPF, CNPJ, placa, matrícula e usuário usam normalização para comparação. Renda aceita zero; aluguel e crédito exigem valores positivos, finitos e com centavos exatos. Períodos precisam terminar após o início.

Alterações cadastrais e de renda incrementam a versão do cliente e invalidam aprovações/reprovações anteriores, preservando contratos executados. Alterações de proposta exigem nova análise. Pareceres, contratos e associações preservam o histórico. A análise financeira bloqueia cliente e pedido na mesma transação; unicidade e bloqueios protegem a execução contratual e a reutilização de crédito.

## Conexão do backend

Requisitos: JDK 25, Maven e um projeto Supabase. Em `backend`, copie `.env.example` para `.env` e configure:

| Variável | Finalidade |
| --- | --- |
| `SUPABASE_DB_URL` | URL JDBC do banco com `sslmode=require` ou verificação de certificado. |
| `SUPABASE_DB_USERNAME` | Login dedicado, por exemplo `allocar_api`. |
| `SUPABASE_DB_PASSWORD` | Senha do login dedicado, diferente da senha administrativa. |
| `SUPABASE_DB_POOL_SIZE` | Máximo de conexões Hikari, padrão 5. |

O arquivo usa o formato Java properties, sem aspas. Caracteres de escape, como barra invertida, precisam seguir esse formato. `.env` é ignorado pelo Git. Em implantação, prefira variáveis de ambiente.

Copie a conexão em **Supabase → Connect**. Conexão direta normalmente exige IPv6; em redes IPv4 use **Session pooler, porta 5432**. O backend acrescenta o sufixo do projeto ao usuário quando o host é um pooler. Use as credenciais de banco, não as chaves da API. Consulte a [documentação de conexões do Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

Com `JAVA_HOME` apontando para JDK 25, execute em `backend`:

```powershell
# Iniciar o backend com JDBC
mvn spring-boot:run '-Dspring-boot.run.profiles=supabase'
```

`service.SupabaseDatabaseConfiguration` configura o pool JDBC, as transações e a validação do login dedicado. `service.DatabaseProperties` reúne somente as propriedades usadas na conexão. A inicialização não altera tabelas nem carrega dados. A administração do banco é feita pelo Supabase, separadamente da aplicação.

O perfil `supabase` usa um login sem privilégios administrativos e sem bypass de RLS, membro de `allocar_backend`. `ContextoBanco.comConta` define a conta apenas durante a transação e impede trocar o responsável em uma transação aninhada. Esse identificador vem da sessão autenticada pelo servidor. RLS restringe pedidos ao cliente, agente responsável e banco do crédito associado. O contexto não é uma credencial de autenticação e não deve ser aceito diretamente de parâmetros HTTP.

`allocar.credencial_login(text)` faz a consulta interna anterior à autenticação; o hash é conferido pelo Java e não é enviado na resposta HTTP. `allocar.registrar_conta(text,jsonb,text)` cria um novo cadastro com seus relacionamentos em uma única transação, gerando identidades no banco e mantendo novas instituições sem validação e inativas. São funções privadas com `search_path` fixo e execução exclusiva de `allocar_backend`; não concedem acesso aos papéis da Data API. A política de desativação permite encerrar a própria conta sem remover o histórico.

## Dados fictícios

Os registros de demonstração no Supabase usam UUIDs fixos para identificar os cenários.

Todas as contas de demonstração usam a senha **`AlloCar@Teste2026`**, armazenada como PBKDF2-HMAC-SHA256 com 310.000 iterações e salt próprio por conta. Essa senha serve aos cenários fictícios do AlloCar; não é a senha JDBC ou de acesso ao Supabase.

| Usuário | Cenário |
| --- | --- |
| `ana` | Cliente com pedidos em análise, aprovado, cancelado e executado. |
| `carlos` | Dois vínculos, reprovação e pedido em outra instituição. |
| `carla` | Veículo de cliente, contrato executado e aprovação em outra instituição. |
| `diego.inativo` | Conta desativada. |
| `eva.sem.renda` | Nenhum vínculo, pedido bancário e reprovação. |
| `fernanda.tres.rendas` | Limite de três vínculos, contrato com crédito e reenvio de pedido. |
| `gabriel.reanalise` | Pareceres invalidados por alteração de proposta e de renda. |
| `hyper.empresa`, `horizonte.empresa` | Agentes habilitados com escopos distintos. |
| `empresa.pendente`, `empresa.inativa` | Instituição não validada e conta institucional inativa. |
| `hyper.banco`, `horizonte.banco` | Bancos concedentes distintos, créditos livres e associados. |
| `banco.pendente` | Banco sem validação institucional. |

O conjunto contém 14 contas, 6 automóveis, 14 pedidos, 10 pareceres, 3 contratos de aluguel, 4 créditos e 2 associações. Os pedidos `AL-007` e `AL-008` preservam pareceres anteriores inválidos; `AL-014` representa reenvio após reprovação. A taxa zero aparece em um crédito livre. Os dados não definem uma fórmula automática de aprovação financeira.

## Verificação local

```powershell
cd backend
mvn test
```

Os testes locais verificam domínio, autenticação e contratos HTTP sem conexão com o Supabase. Para conferir a conexão real, inicie o backend com o perfil `supabase`: a aplicação valida o login dedicado, a tabela de pedidos e as funções privadas de cadastro/login durante a inicialização. Os [testes de integração da API](api.md#testes) usam transações com rollback no projeto configurado.
