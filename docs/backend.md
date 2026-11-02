# AlloCar — Classes e regras do backend

## Organização dos pacotes

As classes estão sob `com.allocar.backend`, com as seguintes responsabilidades:

| Pacote | Responsabilidade |
| --- | --- |
| `application` | Inicialização e configuração da aplicação Spring Boot. |
| `controller` | Entrada HTTP e tradução de requisições/respostas. |
| `model` | Entidades, objetos de valor, estados e regras de negócio. |
| `repository` | Consultas, persistência e restrições de unicidade dos registros. |
| `service` | Coordenação dos casos de uso, autorização e transações. |

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
