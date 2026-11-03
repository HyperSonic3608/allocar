# AlloCar · Referências e escopo das interfaces

A organização das interfaces segue a jornada de pedido e consulta descrita na [modelagem](modelagem.md) e nas [histórias de usuário](historias-de-usuario.md).

Os estados ilustrativos descritos aqui pertencem aos protótipos Figma. A aplicação usa dados da API, paginação e UUIDs reais; o catálogo não calcula diárias ou disponibilidade, e o cliente informa o valor total da proposta.

## Referência principal: design system do próprio projeto

| Exemplo existente                                                                                      | Aplicação no protótipo                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [09 · Busca de veículos desktop](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=14-21207) | Cabeçalho em toda a largura, área de período, filtros laterais, resultados em cartões e identificação do automóvel em AF17/BF17. Navegação e superfícies comuns às telas do sistema. |
| [10 · Resumo da reserva móvel](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=14-21411)   | Ordem de revisão: veículo, período, cadastro, condições e ação final. Adaptada ao desktop em AF19/BF19, com o componente nativo ResumoReserva na lateral.                            |

As instâncias reutilizam Logo, Botao, Campo, CartaoVeiculo, Metadados e ResumoReserva. Cores e estilos tipográficos vêm da biblioteca AlloCar. As instâncias do produto usam overrides dos componentes da biblioteca. As fotos pertencem aos cartões existentes. A foto do SUV representa um Volkswagen T-Cross, identificado nos rótulos dos cartões.

## Pesquisa em locadoras

| Fonte oficial consultada                                                                                    | Observação                                                                                             | Decisão para AlloCar                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Localiza — Como faço a reserva](https://cliente.localiza.com/faq/como-faco-a-reserva-para-alugar-um-carro) | A reserva pode ser iniciada pelo site ou aplicativo.                                                   | Dar destaque à busca e manter acesso aos pedidos na navegação da conta. No AlloCar, as operações continuam exigindo autenticação.                                           |
| [Localiza — Posso escolher o modelo](https://cliente.localiza.com/faq/posso-escolher-o-modelo-do-carro)     | A escolha na reserva é por grupo; o modelo depende da disponibilidade na retirada.                     | Preservar o requisito do AlloCar de identificar o automóvel por matrícula, marca, modelo, ano e placa. O pedido seleciona um automóvel identificado.                        |
| [Movida — Jornada de reserva](https://www.movida.com.br/reserva/itinerario-escolher)                        | A jornada separa local/data/hora, grupos, tarifas/adicionais e dados cadastrais, com opções de edição. | Separar escolha, período/tipo, revisão e envio; permitir voltar para corrigir os dados. Adaptar a jornada para análise financeira, contrato e crédito previstos no projeto. |

As referências orientam a organização das informações. Textos, identidade e componentes pertencem ao AlloCar.

## Interfaces e histórias

| Telas BF/AF                               | Finalidade                                                               | Histórias existentes |
| ----------------------------------------- | ------------------------------------------------------------------------ | -------------------- |
| 17 Busca, 18 Automóvel, 25 Sem resultados | Encontrar e identificar o automóvel antes de solicitar                   | HU04                 |
| 19 Resumo, 20 Enviado                     | Conferir a proposta e comunicar o início da análise                      | HU04/HU05            |
| 21 Contratos, 22 Detalhe                  | Consultar a contratação ligada ao pedido; estado vazio antes da execução | HU11                 |
| 23 Formulário de crédito, 26 Créditos     | Registrar dados e consultar a associação pelo banco concedente           | HU12                 |
| 24 Histórico de pareceres                 | Relacionar decisão, justificativa e versão do pedido                     | HU09                 |
| 27 Cadastro institucional                 | Representar o cadastro de empresa/banco já descrito                      | HU01                 |

## Regras dos fluxos

- Cadastro e login precedem as operações. A landing encaminha ao acesso; o protótipo oferece entradas de revisão com sessão ilustrativa.
- Enviar o pedido inicia `EM_ANALISE`. Parecer positivo é condição para executar o contrato; associar crédito é uma ação separada.
- O cadastro do cliente continua contemplando RG, CPF, endereço, profissão e até três empregadores/rendimentos. A área institucional usa os campos e a premissa de validação já descritos na HU01.
- O catálogo trabalha com um automóvel identificado. Diárias e totais são exemplos de proposta, sem cobrança real.
- O escopo de negócio compreende cadastro, autenticação, pedidos de aluguel, avaliação financeira, contratos e crédito opcional.
- Filtros de marca, seleção de veículo, tipo institucional e lista de contratos possuem estados de demonstração. Datas e campos usam valores de exemplo.
- O histórico apresenta um parecer de referência.
