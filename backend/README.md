# AlloCar · Backend

API REST em Java com Spring Boot, Spring Security e JDBC, responsável por cadastros, pedidos de aluguel, avaliação financeira, contratos e crédito. A persistência usa PostgreSQL no Supabase, com acesso restrito ao contexto da conta autenticada.

## Execução

Com JDK 25, `JAVA_HOME` configurado e Maven, prepare `backend/.env` a partir de [`.env.example`](.env.example), conforme o [guia de conexão do banco](../docs/database.md#conexão-do-backend). O arquivo usa o formato Java properties, sem aspas, e fica ignorado pelo Git. Em implantação, as mesmas propriedades podem ser fornecidas por variáveis de ambiente.

A partir da raiz do repositório:

```powershell
cd backend
mvn spring-boot:run '-Dspring-boot.run.profiles=supabase'
```

A API responde em **`http://localhost:8080/api`**. O perfil `supabase` habilita a conexão JDBC e valida o login dedicado durante a inicialização. Credenciais de banco permanecem no servidor; a aplicação não cria tabelas nem carrega dados ao iniciar.

Para iniciar frontend e backend no mesmo terminal, execute `npm ci` e `npm run dev:all` na pasta `frontend`, com JDK 25 e Maven disponíveis. O comando inicia este backend e o Vite, encaminha `/api` ao servidor e encerra ambos por `Ctrl+C`. Consulte os [endereços, variáveis e comandos do frontend](../frontend/README.md#execução).

```powershell
mvn test
mvn package
```

O Maven gera o JAR executável em `target/`. As [rotas, os formatos JSON e os exemplos de consumo](../docs/api.md) descrevem o contrato HTTP da aplicação.

## Hospedagem

O [guia de hospedagem](../docs/deploy.md) descreve o serviço Docker no Render, o Blueprint `render.yaml`, as variáveis privadas e a integração com o frontend no Vercel. `GET /api/health` fornece a verificação pública de saúde, e `PORT` define a porta do servidor.

## Organização

```text
src/
├── main/
│   ├── java/com/allocar/backend/
│   │   ├── application/   # BackendApplication.java
│   │   ├── controller/    # rotas HTTP e tratamento de erros
│   │   ├── exception/     # exceções da API e das regras de negócio
│   │   ├── model/         # domínio, estados, DTOs e projeções de leitura
│   │   ├── repository/    # consultas e persistência JDBC
│   │   └── service/       # casos de uso, segurança e transações
│   └── resources/        # propriedades de execução
└── test/java/com/allocar/backend/
    ├── controller/       # contratos HTTP e integração com o banco
    ├── model/            # regras e operações de domínio
    └── service/          # autenticação
```

As classes estão sob `com.allocar.backend`, com as seguintes responsabilidades:

| Pacote | Responsabilidade |
| --- | --- |
| `application` | Inicialização da aplicação Spring Boot. |
| `controller` | Entrada HTTP e tradução de requisições/respostas. |
| `model` | Entidades, objetos de valor, estados e regras de negócio. |
| `repository` | Consultas, persistência e restrições de unicidade dos registros. |
| `service` | Coordenação dos casos de uso, autorização, transações e configuração JDBC. |

`application.BackendApplication` configura a varredura de componentes em `com.allocar.backend`. As classes de `model` usam Java e não dependem de Spring ou de uma conexão com o banco.

## Classes e atributos

| Classe | Dados e comportamento |
| --- | --- |
| `Parte` | UUID, nome, endereço e uma conta por titular; base de cliente e agente. |
| `Conta` | Usuário, hash da senha, titular e ativação/desativação. Instituições exigem validação antes da ativação. |
| `Cliente` | RG, CPF, profissão, versão do cadastro e até três vínculos; atualização cadastral e cálculo de renda total. |
| `Endereco` | Logradouro, número, complemento opcional, bairro, cidade, UF e CEP; objeto de valor imutável. |
| `VinculoEmpregaticio` | UUID, empregador e rendimento não negativo; atualização pelo cadastro preserva o identificador. |
| `Agente`, `Empresa`, `Banco` | CNPJ, validação institucional e tipo de agente; avaliação e modificação dos pedidos de seu escopo. Banco concede crédito. |
| `Automovel` | Matrícula, ano, marca, modelo, placa e proprietário cliente/empresa/banco. |
| `PropostaAluguel` | Automóvel, início, fim, tipo e valor total; objeto de valor que valida o período e o preço. |
| `PedidoAluguel` | Cliente, agente responsável, proposta, estado, versão, pareceres e contrato; controla o ciclo de vida. |
| `DadosCliente` | Cópia imutável dos dados e rendimentos usados na avaliação, identificada pela versão do cadastro. |
| `ParecerFinanceiro` | UUID, pedido, agente, decisão, justificativa, versão do pedido, data, dados cadastrais e proposta analisada. |
| `ContratoAluguel` | Pedido, tipo, valor, data de execução, parecer aprovador, proprietário registrado e crédito opcional. |
| `ContratoCredito` | Número, valor, taxa, banco concedente e vínculo exclusivo com um aluguel. |

`StatusPedido` representa `EM_ANALISE`, `APROVADO`, `REPROVADO`, `CANCELADO` e `EM_EXECUCAO`. `DecisaoParecer` aceita aprovação ou reprovação; `TipoContrato` distingue `PADRAO`/`COM_CREDITO`, e `TipoAgente` distingue empresa/banco.

## Operações e invariantes

- `PedidoAluguel.solicitar` recebe a conta ativa de um cliente, um agente habilitado e uma proposta válida; o pedido inicia em análise, na versão 1.
- `alterar`, `submeterParaAnalise` e `cancelar` exigem a versão esperada. Alteração e reenvio incrementam a versão e invalidam o parecer anterior. Cancelamento é exclusivo do cliente titular. Estados terminais bloqueiam essas operações.
- `Agente.avaliarPedido` exige o agente responsável, a versão do pedido e a versão do cadastro consultadas, além de decisão e justificativa. A avaliação financeira é uma decisão do agente; não há aprovação automática por faixa de renda.
- `Cliente.atualizarCadastro` e as operações de vínculos só aceitam a conta do titular. Mudanças incrementam a versão cadastral. Um parecer sobre cadastro anterior deixa de autorizar execução e o pedido volta a ser apresentado em análise.
- Os pareceres preservam a proposta e os dados financeiros analisados. As coleções são expostas como cópias imutáveis. Alterações posteriores no cadastro não reescrevem o histórico nem um contrato executado.
- `PedidoAluguel.executarContrato` exige aprovação vigente e o agente responsável. O contrato é criado uma única vez; guarda tipo, valor, data, parecer e proprietário. Sua criação não transfere automaticamente o automóvel.
- `Banco.concederCredito` exige a conta ativa do próprio banco. `associarAoAluguel`/`associarCredito` só aceitam o banco concedente e preservam o vínculo nos dois sentidos. Um crédito não pode financiar dois aluguéis; um aluguel não recebe dois créditos.
- Crédito é opcional e pode ser concedido antes da associação. A associação referencia um contrato de aluguel executado; ela não aprova o pedido nem executa o contrato. O tipo contratual não transfere a propriedade ou gera um crédito automaticamente.
- Valores monetários usam `BigDecimal` com centavos exatos: renda pode ser zero; aluguel e crédito devem ser positivos. Taxa não pode ser negativa. Uma operação inválida lança `RegraDeNegocioException` antes de alterar os dados.

## Contexto dos responsáveis

As contas passadas aos métodos devem ser obtidas do contexto autenticado pelo caso de uso, e não de identificadores enviados livremente pelo cliente HTTP. O modelo verifica conta ativa, titularidade e escopo institucional. `Conta` recebe um hash produzido pelo adaptador de autenticação; seus objetos não devem ser utilizados diretamente como respostas HTTP.

O agente responsável identifica o escopo do pedido. O cliente titular e esse agente podem consultá-lo; após a associação, o banco concedente também tem acesso à consulta. O banco não recebe permissão para alterar um pedido de outra instituição apenas por conceder crédito.

Unicidade de usuário, CPF, CNPJ, matrícula, placa e número de crédito envolve o conjunto dos registros e deve ser garantida por consultas e restrições de persistência. A coordenação entre instâncias persistidas exige transações e controle de concorrência no armazenamento.

## Acesso ao PostgreSQL

`service.SupabaseDatabaseConfiguration` configura JDBC, Hikari e transações no perfil `supabase`. O login dedicado usa o schema privado `allocar`, com políticas RLS e restrições SQL. As [instruções de conexão e os dados fictícios](../docs/database.md) descrevem as variáveis de ambiente usadas na execução.

`AutomovelRepository.buscar` consulta o catálogo por marca e ano, retornando `VeiculoCatalogo`. `PedidoRepository.listar` retorna `ResumoPedido` conforme o escopo da conta. Esses tipos são projeções de leitura; as entidades preservam suas regras e independência do Spring.

`ContaRepository` coordena os cadastros atômicos e a leitura interna das credenciais; `ClienteRepository` mantém o perfil e os vínculos; `PedidoRepository` também grava propostas e transições; `FinanceiroRepository` mantém pareceres, contratos e créditos. As escritas usam o mesmo contexto transacional e as restrições SQL de negócio.

Os repositórios recebem a conta do contexto autenticado do servidor e utilizam `ContextoBanco.comConta` para abrir uma transação e definir o responsável localmente. A identificação expira no término da transação, evitando reaproveitamento de permissões entre conexões do pool. As consultas usam parâmetros vinculados.

O banco reproduz as invariantes persistidas com unicidade, chaves estrangeiras, validações, snapshots e bloqueios. Alterações na API e nos adaptadores devem preservar as regras do modelo e do banco.

## API REST

Os controllers expõem os [contratos HTTP e exemplos JSON](../docs/api.md). `AutenticacaoService` verifica hashes PBKDF2 e usa `ContaAutenticada` como principal de sessão, sem senha/hash. `SegurancaConfiguration` aplica autenticação, perfis, CSRF e CORS. `ClienteService` coordena perfil e rendimentos; `AluguelService` coordena catálogo, pedidos, pareceres, execução e crédito.

A sessão usa o cookie `JSESSIONID`, `HttpOnly`, com expiração após 30 minutos sem atividade. Operações de escrita exigem token CSRF, inclusive cadastro e login; o cliente obtém outro token após autenticar. `ALLOCAR_ALLOWED_ORIGINS` define as origens permitidas pelo CORS, e `ALLOCAR_COOKIE_SECURE` controla o atributo `Secure` do cookie. O [fluxo de sessão e CSRF](../docs/api.md#sessão-e-csrf) detalha os cabeçalhos e a sequência das requisições.

`ApiDtos` define entradas validadas e respostas próprias para a API, sem serializar entidades de negócio. `ApiExceptionHandler` transforma validações, conflitos e falhas de autorização/persistência em erros públicos. O frontend envia a versão recebida na consulta; o servidor bloqueia o cadastro antes do pedido para conferir versões e executar a operação na mesma transação.

As regras dos objetos de domínio continuam independentes dos adaptadores HTTP/JDBC. Na persistência, as invariantes são verificadas pelos serviços e pelas restrições/triggers do banco. Pareceres históricos permanecem cópias dos dados efetivamente analisados.

## Exemplo de uso

Com cliente, agente e contas ativas provenientes do cadastro:

```java
var proposta = new PropostaAluguel(
        automovel, inicio, fim, TipoContrato.PADRAO, new BigDecimal("1250.00"));
var pedido = PedidoAluguel.solicitar(contaCliente, empresa, proposta);

empresa.avaliarPedido(contaEmpresa, pedido, DecisaoParecer.APROVADO,
        "Cadastro e rendimentos analisados.", pedido.getVersao(), cliente.getVersaoCadastro());

var contrato = pedido.executarContrato(contaEmpresa, pedido.getVersao());
var credito = banco.concederCredito(contaBanco, "CR-001", new BigDecimal("1250.00"), BigDecimal.ONE);
contrato.associarCredito(contaBanco, credito);
```

Os métodos também permitem injetar `Clock` na solicitação para controlar as datas dos pareceres e contratos em testes.

## Testes

Em `backend`, execute a suíte local:

```powershell
mvn test
```

Os testes verificam regras de domínio, autenticação, validação de entradas, sessão, CSRF, CORS e contratos HTTP sem conexão com o banco remoto. Os cenários de domínio cobrem permissões, estados terminais, reanálise, versões desatualizadas, execução contratual e exclusividade do crédito.

Para executar a integração com o banco configurado em `.env`:

```powershell
mvn '-Dtest=SupabaseApiIT' test
```

`SupabaseApiIT` ativa o perfil `supabase` e usa os repositórios, a cadeia de segurança e as tabelas reais. Cada cenário cria registros exclusivos em uma transação com rollback ao final, preservando os dados fictícios existentes. Os [detalhes dos testes de integração](../docs/api.md#testes) complementam o roteiro.
