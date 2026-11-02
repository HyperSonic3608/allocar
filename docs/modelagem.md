# AlloCar — Modelagem

Requisitos, atores, regras de domínio, casos de uso e arquitetura do sistema de aluguel de automóveis AlloCar.

## Atores e autorização

| Ator      | Responsabilidade                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Visitante | Cadastro prévio e autenticação; nenhum acesso aos dados do negócio.                                  |
| Cliente   | Manter seus dados, criar, consultar, alterar e cancelar seus pedidos.                                |
| Agente    | Consultar pedidos de sua atuação, modificar e avaliar financeiramente; executar contratos aprovados. |
| Empresa   | Especialização de agente; pode ser proprietária de automóveis.                                       |
| Banco     | Especialização de agente; pode ser proprietário e conceder/associar crédito.                         |

Cliente, empresa e banco são especializações de `Parte` no domínio. `Agente` é abstrato e agrupa empresa e banco. `Conta` contém credenciais, sem duplicar identificação de negócio. Uma conta identifica uma parte.

## Requisitos funcionais

| ID   | Requisito                                                                           | Caso de uso | História   |
| ---- | ----------------------------------------------------------------------------------- | ----------- | ---------- |
| RF01 | Cadastrar cliente ou agente antes do uso.                                           | UC01        | HU01       |
| RF02 | Autenticar com usuário e senha e restringir acesso por perfil.                      | UC02        | HU02       |
| RF03 | Manter identificação, endereço, profissão e até três vínculos com renda de cliente. | UC03        | HU03       |
| RF04 | Introduzir pedido de aluguel.                                                       | UC04        | HU04       |
| RF05 | Consultar pedidos e status.                                                         | UC05        | HU05, HU08 |
| RF06 | Cliente modifica seu pedido.                                                        | UC06        | HU06       |
| RF07 | Cliente cancela seu pedido.                                                         | UC07        | HU07       |
| RF08 | Agente realiza avaliação financeira e emite parecer.                                | UC08        | HU09       |
| RF09 | Agente modifica pedido.                                                             | UC09        | HU10       |
| RF10 | Executar contrato após parecer positivo.                                            | UC10        | HU11       |
| RF11 | Registrar crédito concedido por banco agente e associá-lo ao aluguel.               | UC11        | HU12       |
| RF12 | Registrar matrícula, ano, marca, modelo, placa e proprietário do automóvel.         | UC04, UC10  | HU04, HU11 |

RF12 especifica os dados de identificação do automóvel. O catálogo é provisionado pela aplicação ou por migrações.

## Requisitos não funcionais

| ID    | Restrição / critério de projeto                                                                                       |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| RNF01 | Aplicação web acessada pela Internet por clientes e agentes.                                                          |
| RNF02 | Java JDK 25, Spring Boot 4.0.x e Maven no servidor central.                                                           |
| RNF03 | React + Vite para construção dinâmica de páginas.                                                                     |
| RNF04 | Supabase como PostgreSQL; arquitetura MVC com separação de apresentação e gestão.                                     |
| RNF05 | Login obrigatório para operações do negócio. API também verifica sessão e autorização.                                |
| RNF06 | Decisão de projeto: senhas em hash e credenciais PostgreSQL somente no servidor.                                      |
| RNF07 | Decisão de projeto: dinheiro em Decimal/BigDecimal e operações críticas transacionais.                                |
| RNF08 | Decisão de interface: rótulos visíveis, status por texto, mensagens de erro e navegação por teclado. |

## Regras do domínio

| ID   | Regra                                                                                                                      | Origem                       |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| RN01 | Somente usuários cadastrados e autenticados operam pedidos e contratos.                                                    | Enunciado                    |
| RN02 | Cada cliente tem no máximo três vínculos empregatícios, cada qual com empregador e rendimento.                             | Enunciado                    |
| RN03 | Empresa e banco podem avaliar e modificar pedidos.                                                                         | Enunciado                    |
| RN04 | A execução de contrato depende de parecer financeiro positivo.                                                             | Enunciado                    |
| RN05 | Automóvel pode pertencer a cliente, empresa ou banco conforme o contrato.                                                  | Enunciado                    |
| RN06 | Crédito é opcional e obrigatoriamente concedido por um banco agente.                                                       | Enunciado                    |
| RN07 | Cliente acessa somente seus pedidos; agente acessa o escopo institucional autorizado.                                      | Premissa de autorização      |
| RN08 | Todo pedido seleciona um automóvel e um período com fim posterior ao início.                                               | Premissa de modelagem        |
| RN09 | CPF, usuário, matrícula e placa são únicos; CNPJ identifica o agente.                                                      | Premissa de integridade      |
| RN10 | Cada pedido gera no máximo um contrato; cada contrato de aluguel associa no máximo um crédito.                             | Premissa de cardinalidade    |
| RN11 | Alterar pedido incrementa a versão e invalida parecer anterior, voltando à análise.                                        | Premissa de consistência     |
| RN12 | Alteração/cancelamento permitidos em EM_ANALISE, APROVADO e REPROVADO; vedados em CANCELADO e EM_EXECUCAO.                 | Premissa de ciclo de vida    |
| RN13 | Parecer exige decisão, justificativa, agente, data e versão do pedido. Apenas aprovação da versão atual autoriza execução. | Premissa de rastreabilidade  |
| RN14 | Crédito só pode ser concedido/associado pelo banco concedente autenticado; empresas não concedem crédito.                  | Premissa de autorização      |
| RN15 | Automóvel possui exatamente um proprietário atual; não se impõe transferência automática em todo aluguel.                  | Interpretação da propriedade |

As premissas de autorização, integridade, cardinalidade, consistência e rastreabilidade complementam as regras de negócio.

## Ciclo de vida do pedido

| Origem                            | Ação / condição                             | Destino                  |
| --------------------------------- | ------------------------------------------- | ------------------------ |
| Não existente                     | Cliente envia dados válidos                 | EM_ANALISE               |
| EM_ANALISE                        | Agente emite parecer positivo vigente       | APROVADO                 |
| EM_ANALISE                        | Agente emite parecer negativo               | REPROVADO                |
| EM_ANALISE / APROVADO / REPROVADO | Cliente ou agente altera dados              | EM_ANALISE (nova versão) |
| EM_ANALISE / APROVADO / REPROVADO | Cliente confirma cancelamento               | CANCELADO                |
| APROVADO                          | Agente executa contrato com parecer vigente | EM_EXECUCAO              |

`CANCELADO` e `EM_EXECUCAO` são estados terminais do pedido. A criação submete o pedido à análise, sem rascunho persistido.

## Dicionário do modelo de classes

| Elemento                 | Significado / restrição                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Parte                    | Identidade e endereço compartilhados por cliente e agentes. Classe abstrata.                                                             |
| Conta                    | Usuário único, hash da senha e situação de acesso; vínculo 1:1 com Parte.                                                                |
| Cliente                  | CPF, RG, profissão e cadastro do contratante.                                                                                            |
| Endereco                 | Objeto de valor: logradouro, número, complemento opcional, bairro, cidade, UF e CEP.                                                     |
| VinculoEmpregaticio      | Empregador e rendimento mensal não negativo; 0..3 por cliente.                                                                           |
| Agente / Empresa / Banco | Agente abstrato; Empresa e Banco são tipos concretos.                                                                                    |
| Automovel                | Matrícula, ano, marca, modelo, placa e proprietário Parte.                                                                               |
| PedidoAluguel            | Cliente, automóvel, início, fim, status e versão.                                                                                        |
| ParecerFinanceiro        | Histórico de decisões associado à versão do pedido e ao agente avaliador.                                                                |
| ContratoAluguel          | Pedido de origem, tipo, valor total e instante de execução. O cliente e automóvel são obtidos pelo pedido.                               |
| ContratoCredito          | Número, valor e taxa; um Banco concedente; associação opcional e exclusiva a um aluguel.                                                 |
| StatusPedido             | EM_ANALISE, APROVADO, REPROVADO, CANCELADO, EM_EXECUCAO.                                                                                 |
| TipoContrato             | Código de modalidade contratual: PADRAO / COM_CREDITO. Propriedade não é deduzida automaticamente do código. |
| PropostaAluguel           | Automóvel, período, tipo e valor total reunidos em um objeto de valor validado. |
| DadosCliente             | Fotografia imutável da identificação, profissão e rendimentos usados no parecer, com versão cadastral. |

O diagrama é conceitual: IDs são UUIDs e não substituem identificadores naturais. Atributos de associação aparecem como relações, evitando duplicar FKs no modelo UML. RG é texto; senhas não são armazenadas em texto puro.

## Casos de uso: fluxos e exceções

| UC   | Fluxo principal                                                                          | Alternativas / pós-condições                                                                                                |
| ---- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| UC01 | Visitante informa tipo de conta, identificação e credenciais; sistema valida e cadastra. | Duplicidade ou campo inválido impede cadastro. Conta de agente exige validação institucional antes da ativação (premissa).  |
| UC02 | Usuário informa credenciais; sistema autentica e apresenta a área do perfil.             | Erro genérico para credenciais inválidas; sessão ausente bloqueia negócio; logout encerra acesso.                           |
| UC03 | Cliente consulta e atualiza cadastro e rendimentos.                                      | Quarto vínculo e dados inválidos são rejeitados. A desativação preserva os vínculos históricos. |
| UC04 | Cliente escolhe automóvel, tipo e período; sistema cria pedido EM_ANALISE.               | Período inválido ou cadastro incompleto impede envio e preserva os campos na interface.                                     |
| UC05 | Sistema lista pedidos autorizados e apresenta os detalhes do escolhido.                  | Lista vazia orienta criar pedido; recurso alheio não é exposto.                                                             |
| UC06 | Cliente altera pedido permitido e reenvia para análise.                                  | Estado terminal ou versão concorrente impede gravação.                                                                      |
| UC07 | Cliente solicita cancelamento e confirma; sistema marca CANCELADO.                       | Desistir mantém pedido. Estado não cancelável impede operação.                                                              |
| UC08 | Agente consulta dados, registra decisão e justificativa.                                 | Dados insuficientes permitem parecer negativo; versão desatualizada exige recarregar.                                       |
| UC09 | Agente autorizado altera pedido e registra nova versão.                                  | Não altera dados pessoais do cliente por este caso de uso; parecer anterior deixa de valer.                                 |
| UC10 | Agente revisa pedido aprovado, define tipo/propriedade aplicáveis e executa contrato.    | Sem aprovação vigente, pedido cancelado ou contrato já existente impedem execução. Registro é atômico.                      |
| UC11 | Banco concedente informa número, valor e taxa do crédito e associa ao aluguel.           | Concedente diferente, segundo crédito ou dados inválidos são rejeitados; aluguel sem crédito continua permitido.            |

## Arquitetura

O servidor central é um monólito modular Spring Boot. Navegadores acessam a apresentação React pela Internet; a apresentação chama Controllers REST via HTTPS/JSON. Controllers delegam aos serviços de aplicação; serviços aplicam regras sobre o domínio e usam repositórios para persistir no PostgreSQL do Supabase. Segurança participa de cada operação protegida.

O subsistema `apresentacao.web` realiza a construção dinâmica das páginas e corresponde à View do MVC. O backend organiza os pacotes diretamente sob `com.allocar.backend`: `application` inicializa e configura a aplicação; `controller` recebe requisições; `model` contém as entidades e regras; `repository` atende à persistência; `service` coordena casos de uso e transações. O navegador não recebe credenciais do PostgreSQL e não altera pedidos diretamente no banco.

Os pacotes UML representam a organização lógica dos dois subsistemas e suas dependências.

## Relação entre interfaces e domínio

Os rótulos **Pendente** e **Em análise** representam `EM_ANALISE`; **Rejeitado** corresponde a `REPROVADO`. A consulta de contratos apresenta o estado vazio antes da execução. Associar crédito não equivale a aprovar financeiramente ou executar o contrato.

O [guia dos protótipos](prototipos/README.md) relaciona as interfaces às histórias de usuário. O [design system](design-system/README.md) descreve tokens, componentes e padrões de composição.

## Classes do backend

O [guia das classes e regras](../backend/README.md) relaciona os atributos e métodos de `com.allocar.backend.model`. `PropostaAluguel` reúne os dados da proposta; `DadosCliente` preserva os dados financeiros avaliados. Mudanças no cadastro exigem nova análise antes da execução, e contratos executados mantêm o parecer e as condições registradas.
