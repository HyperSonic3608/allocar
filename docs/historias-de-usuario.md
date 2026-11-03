# AlloCar · Histórias de usuário

As prioridades agrupam as histórias: P1 = autenticação/cadastro e fluxo inicial; P2 = gestão/contratos. Os critérios de aceitação descrevem os comportamentos e as restrições de cada operação.

## HU01 — Cadastro prévio (P1, UC01)

Como visitante, quero cadastrar minha conta de cliente ou agente para obter acesso ao AlloCar.

- Dado um cadastro válido e um usuário disponível, quando confirmar, então a conta é registrada.
- Dado usuário/CPF/CNPJ já cadastrado ou campos inválidos, quando enviar, então o cadastro é rejeitado com mensagem compreensível.
- Dado um agente, quando solicitar cadastro, então o tipo empresa/banco é registrado e a ativação depende de validação institucional (premissa).

## HU02 — Login e restrição de acesso (P1, UC02)

Como usuário cadastrado, quero entrar com usuário e senha para acessar apenas as operações do meu perfil.

- Dadas credenciais válidas de conta ativa, quando entrar, então a área do perfil é apresentada.
- Dadas credenciais inválidas, quando entrar, então uma mensagem genérica é exibida e o acesso continua bloqueado.
- Dada sessão ausente/encerrada, quando chamar operação de negócio, então o sistema exige autenticação, inclusive na API.
- Dada sessão válida, quando sair, então ela deixa de autorizar novas operações.

## HU03 — Cadastro do cliente (P1, UC03)

Como cliente, quero consultar e manter identificação, endereço, profissão e rendimentos para que os agentes possam avaliar meus pedidos.

- Dados nome, RG, CPF, endereço e profissão válidos, quando salvar, então o cadastro é atualizado.
- Dados até três vínculos com empregador e renda, quando salvar, então cada par empregador/rendimento é preservado.
- Dados três vínculos existentes, quando tentar incluir o quarto, então a inclusão é bloqueada.
- Dado cliente diferente do autenticado, quando tentar consultar/alterar, então o acesso é negado.
- Dado pedido de exclusão, quando confirmar, então a conta é desativada e o histórico contratual é preservado (premissa).
- Dados pareceres sobre cadastro anterior, quando mudar identificação, endereço, profissão ou renda, então pedidos abertos exigem nova análise e contratos executados preservam suas condições.
- Dada uma versão cadastral desatualizada, quando salvar, então o servidor recusa a escrita e a interface orienta recarregar.

## HU04 — Criar pedido (P1, UC04)

Como cliente, quero solicitar um automóvel por um período para iniciar um aluguel pela Internet.

- Dados cadastro completo, automóvel, agente responsável habilitado, tipo, período válido e valor total positivo, quando enviar, então é criado pedido EM_ANALISE com identificador e versão inicial.
- Dada data final anterior/igual à inicial, quando enviar, então o sistema impede o pedido e indica o campo.
- Dado o catálogo, quando consultar um automóvel, então matrícula, ano, marca, modelo e placa são identificáveis.
- Dados filtros de marca e ano, quando aplicá-los à busca, então os resultados e a ausência de opções são comunicados; limpar filtros permite retomar a seleção.
- Dado um automóvel escolhido, quando avançar, então sua identificação acompanha o formulário, o resumo e a confirmação do pedido.
- Dado o resumo, quando revisar, então automóvel, período, tipo contratual, cadastro e valor proposto podem ser conferidos antes do envio; enviar inicia a análise financeira.

## HU05 — Acompanhar meus pedidos (P1, UC05)

Como cliente, quero listar meus pedidos e consultar seus status para acompanhar o atendimento.

- Dados pedidos próprios, quando acessar a lista, então são apresentados identificador, veículo, período e status.
- Dado um pedido selecionado, quando abrir, então os detalhes e ações permitidas pelo estado são apresentados.
- Dada lista vazia, então a interface informa a ausência e orienta criar pedido.
- Dado pedido de outro cliente, então seus dados não são expostos.

## HU06 — Alterar meu pedido (P2, UC06)

Como cliente, quero modificar meu pedido para corrigir o veículo ou o período antes da execução.

- Dado pedido alterável, quando salvar dados válidos, então sua versão aumenta e seu estado passa a EM_ANALISE.
- Dado parecer positivo anterior, quando o pedido muda, então ele não autoriza a contratação da nova versão.
- Dado CANCELADO ou EM_EXECUCAO, quando tentar modificar, então a operação é rejeitada.

## HU07 — Cancelar meu pedido (P2, UC07)

Como cliente, quero cancelar meu pedido para desistir da solicitação antes da execução.

- Dado estado cancelável, quando confirmar a ação, então o estado passa a CANCELADO e o pedido permanece no histórico.
- Dada a confirmação aberta, quando escolher manter pedido, então os dados e estado permanecem iguais.
- Dado contrato em execução, quando tentar cancelar o pedido, então a operação é rejeitada.

## HU08 — Fila do agente (P2, UC05)

Como agente, quero consultar pedidos sob minha responsabilidade para organizar a análise financeira.

- Dada sessão de empresa/banco, quando abrir a central, então aparecem somente pedidos do escopo autorizado.
- Dada seleção de pedido, então cliente, rendimentos, automóvel, período e versão são apresentados.
- Dada sessão de cliente, quando tentar acessar a central, então o acesso é negado.

## HU09 — Emitir parecer financeiro (P2, UC08)

Como agente, quero avaliar os pedidos para aprovar ou reprovar a viabilidade financeira do aluguel.

- Dado pedido EM_ANALISE, quando o agente responsável salvar aprovação/reprovação justificada, então o parecer registra agente, data, decisão, versões da proposta e do cadastro e cópias dos dados analisados.
- Dada decisão positiva, então o pedido passa a APROVADO; dada decisão negativa, passa a REPROVADO.
- Dada justificativa vazia ou versão desatualizada, quando salvar, então o parecer é rejeitado.
- Dado histórico autorizado, quando consultar, então decisão, justificativa, agente e versão avaliada podem ser relacionados ao pedido; o histórico não autoriza a execução de uma versão alterada.

## HU10 — Modificar pedido como agente (P2, UC09)

Como agente, quero corrigir pedidos autorizados para adequar a proposta antes da execução do contrato.

- Dado pedido em estado alterável, quando salvar, então há nova versão e retorno à análise.
- Dado pedido fora do escopo ou em estado terminal, então a gravação é rejeitada.
- Dado o formulário do pedido, então esta operação não concede acesso à alteração do cadastro pessoal do cliente.

## HU11 — Executar contrato (P2, UC10)

Como agente, quero executar um contrato com parecer positivo para formalizar o aluguel aprovado.

- Dados pedido APROVADO e parecer positivo das versões atuais da proposta e do cadastro, quando o agente responsável executar, então é criado um único contrato e o pedido passa a EM_EXECUCAO.
- Dado pedido reprovado, cancelado ou sem aprovação vigente, então não há criação de contrato.
- Dado contrato existente, quando repetir a operação, então não é criado contrato duplicado.
- Dado tipo contratual aplicável, então o proprietário registrado é um cliente, empresa ou banco, sem transferência automática presumida.
- Dada a área de contratos, quando ainda não houver contrato executado, então é apresentado o estado vazio; após execução, o cliente pode consultar o contrato vinculado ao pedido.

## HU12 — Associar crédito (P2, UC11)

Como banco agente, quero registrar e associar crédito que concedi ao aluguel para representar seu financiamento.

- Dados número único, valor positivo e taxa não negativa, quando o banco autenticado registrar a concessão, então o crédito fica livre para associação.
- Dados crédito livre do próprio banco e identificador de contrato executado sem outro crédito, quando associar, então ambos passam a compartilhar o vínculo exclusivo.
- Dado contrato apresentado ao banco antes de estar visível nesse escopo, quando informar seu UUID e concluir a associação autorizada, então o banco passa a poder consultá-lo.
- Dada empresa ou banco diferente do concedente, quando tentar conceder/associar, então a operação é negada.
- Dado aluguel sem crédito, então a execução permanece possível com as demais condições satisfeitas.
- Dado crédito já associado ou aluguel com crédito existente, então uma segunda associação é rejeitada.

## Rastreabilidade de telas

Os números BF/AF identificam baixa e alta fidelidade. A tabela relaciona cada história às interfaces e aos elementos do domínio. Consulte os [roteiros e as interações](prototipos/README.md).

Na aplicação, `/agente/creditos/novo` registra a concessão, e `/agente/creditos/associar` vincula um crédito livre ao aluguel. Ambas atendem à HU12, usando os mesmos componentes visuais da área bancária.

| História | Tela(s)                                                                           | Elementos centrais do domínio    |
| -------- | --------------------------------------------------------------------------------- | -------------------------------- |
| HU01     | 02 Cadastro cliente, 27 Cadastro institucional                                    | Conta, Parte, Cliente, Agente    |
| HU02     | 01 Login, 14 Erro                                                                 | Conta                            |
| HU03     | 03 Cadastro do cliente                                                            | Cliente, VinculoEmpregaticio     |
| HU04     | 17 Busca, 18 Automóvel, 05 Período/tipo, 19 Resumo, 20 Enviado, 25 Sem resultados | PedidoAluguel, Automovel         |
| HU05     | 04 Lista, 06 Detalhes, 13 Reprovação                                              | PedidoAluguel, ParecerFinanceiro |
| HU06     | 07 Alteração                                                                      | PedidoAluguel, ParecerFinanceiro |
| HU07     | 08 Confirmação, 09 Cancelado                                                      | PedidoAluguel                    |
| HU08     | 10 Fila do agente                                                                 | Agente, PedidoAluguel            |
| HU09     | 11 Avaliação, 12 Aprovação, 13 Reprovação, 24 Histórico                           | ParecerFinanceiro                |
| HU10     | 11 Avaliação → 07 Alteração (formulário compartilhado)                            | Agente, PedidoAluguel            |
| HU11     | 12 Contrato, 15 Em execução, 21 Lista, 22 Detalhe                                 | ContratoAluguel, Parte           |
| HU12     | 12 Contrato, 23 Formulário, 16 Associado, 26 Créditos                             | Banco, ContratoCredito           |
