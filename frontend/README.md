# AlloCar · Frontend

Interface React com Vite, React Router e CSS, baseada no [protótipo de alta fidelidade](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=4-826). A landing page usa os layouts desktop e móvel do mesmo arquivo.

## Execução

Com Node.js 22.12 ou superior:

```bash
cd frontend
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. Os botões “Entrar como cliente” e “Entrar como agente” selecionam os respectivos fluxos de demonstração. Os campos vêm preenchidos com exemplos; nenhuma credencial é enviada ou armazenada. O estado fica na memória da página e reinicia ao recarregar. Todas as rotas podem ser abertas diretamente para revisão visual.

```bash
npm run lint
npm run build
npm run preview
```

`npm run format` padroniza a formatação do código, preservando os assets originais e os arquivos de tokens exportados/gerados.

A hospedagem do build deve servir `dist/index.html` para rotas da aplicação, preservando as URLs dos arquivos estáticos.

## Organização

```text
src/
├── assets/brand/      # assinatura oficial em SVG
├── assets/figma/      # ícones e fotografias originais, com manifesto de origem
├── components/
│   ├── layout/       # cabeçalhos, colunas, listas de etapas e painéis laterais
│   ├── rental/       # automóveis, progresso e resumo do pedido
│   └── ui/           # botões, campos, cartões, metadados e feedback
├── data/             # dados locais e correspondência entre rotas e quadros
├── pages/            # composição das interfaces por fluxo
├── state/            # contexto e reducer da navegação demonstrativa
└── styles/           # export do Figma, tokens CSS e estilos de composição
```

`PrototypeOverlays` reúne os diálogos com foco modal e fechamento por Escape. Formulários usam campos e validação nativos; os componentes compartilham estados de foco, hover, seleção e feedback. Os layouts se reorganizam para telas estreitas; a tabela do agente tem rolagem horizontal própria.

## Design system em código

`src/styles/figma.tokens.json` preserva IDs, nomes, coleções, valores e aliases de **93 variáveis visuais**, **53 estilos de texto** e **3 estilos de sombra**. `scripts/generate-tokens.mjs` converte esse export em propriedades CSS e classes tipográficas de `src/styles/tokens.css`.

```bash
npm run tokens
node scripts/generate-tokens.mjs --check
```

Os aliases semânticos continuam referenciando os primitivos por `var(...)`. Por exemplo, componentes usam `--cor-acao-primaria`, `--cor-superficie-cartao`, `--espaco-24` e `--raio-16`. A fonte Inter é distribuída localmente por `@fontsource/inter`, sem dependência de Google Fonts em tempo de execução. O manifesto dos ícones e fotografias registra os quadros de origem sem depender de URLs temporárias do Figma.

## Rotas e referências

| Quadro | Interface | Rota |
| --- | --- | --- |
| AF00 / AF00M | Landing desktop / móvel | `/` |
| AF01 | Acesso | `/entrar` |
| AF02 | Cadastro de cliente | `/cadastro` |
| AF03 | Perfil e rendimentos | `/meu-cadastro` |
| AF04 | Meus pedidos | `/pedidos` |
| AF05 | Novo pedido | `/pedidos/novo` |
| AF06 | Detalhe e acompanhamento | `/pedidos/AL-001` |
| AF07 | Alterar pedido | `/pedidos/AL-001/alterar` |
| AF08 | Confirmar cancelamento | `/pedidos/AL-001/cancelar` |
| AF09 | Pedido cancelado | `/pedidos/AL-001/cancelado` |
| AF10 | Central do agente | `/agente` |
| AF11 | Análise financeira | `/agente/pedidos/AL-001/analise` |
| AF12 | Revisão do contrato aprovado | `/agente/pedidos/AL-001/aprovado` |
| AF13 | Pedido reprovado | `/pedidos/AL-001/reprovado` |
| AF14 | Erro de acesso | `/entrar/erro` |
| AF15 | Contrato em execução | `/contratos/CT-001/executado` |
| AF16 | Recibo de associação | `/agente/creditos/CR-001/associado` |
| AF17 | Busca de veículos | `/veiculos` |
| AF18 | Detalhe do automóvel | `/veiculos/onix` ou `/veiculos/tcross` |
| AF19 | Resumo e revisão | `/pedidos/revisao` |
| AF20 | Confirmação de envio | `/pedidos/AL-001/enviado` |
| AF21 | Meus contratos | `/contratos` |
| AF22 | Consulta do contrato | `/contratos/CT-001` |
| AF23 | Associar crédito | `/agente/creditos/associar` |
| AF24 | Histórico de pareceres | `/agente/historico` |
| AF25 | Busca sem resultados | `/veiculos/sem-resultados` |
| AF26 | Créditos do banco | `/agente/creditos` |
| AF27 | Cadastro institucional | `/cadastro/instituicao` |

`src/data/screens.js` relaciona essas rotas aos IDs dos quadros. Os contêineres das interfaces também expõem `data-figma-id`; a landing informa o quadro móvel por `data-figma-mobile-id`.

Os oito painéis auxiliares podem ser abertos com `?painel=nome` em uma rota, por exemplo `/agente?painel=ajuda`: `decisao`, `decisao-obrigatoria`, `pedido-aprovado`, `contrato`, `creditos`, `pedido-carlos`, `ajuda` e `documentos`. Decisão, validação do parecer e consultas dos pedidos AL-002/AL-003 também são acionados pelos controles correspondentes nas telas.

## Interações locais

A seleção do automóvel e das datas acompanha o pedido e seu resumo. Filtros por marca alteram o catálogo; o ano 2026 abre o estado sem resultados. O cadastro confere a confirmação da senha; o perfil mantém até três rendimentos. Alterar a proposta solicita uma nova análise; cancelar modifica o estado apresentado na lista. A decisão exige justificativa, a execução torna o contrato visível na lista e a associação de crédito gera o recibo.

Essas interações são simulações de interface em memória. Os botões de acesso selecionam um perfil demonstrativo e não autenticam usuários. Não há cliente HTTP, chamadas à API, cookies de sessão ou persistência de credenciais no frontend.

## Testes de navegador

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright percorre as 28 rotas em 1440 px e 390 px (1536 px na central do agente), verifica conteúdo, imagens, ausência de overflow da página e ausência de chamadas à API ou a serviços externos. Também exercita cadastro e rendimentos, pedido/edição/cancelamento, parecer/execução/crédito e os oito painéis com foco e Escape. As capturas de cada tela ficam em `test-results/`, ignorado pelo Git.
