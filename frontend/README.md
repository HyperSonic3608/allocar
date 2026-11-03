# AlloCar · Frontend

Interface React com Vite, React Router e CSS, baseada no [protótipo de alta fidelidade](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=4-826). Consome a [API REST do backend](../docs/api.md) para autenticação, cadastro, catálogo, pedidos, análise financeira, contratos e crédito.

## Execução

Requisitos: Node.js 22.12 ou superior, JDK 25 com `JAVA_HOME` configurado e Maven no `PATH`. Confira `java -version` e `mvn -version`: ambos devem usar o JDK 25. Prepare o arquivo `backend/.env` conforme o [README do backend](../backend/README.md#execução); as credenciais JDBC ficam exclusivamente no servidor.

A partir da raiz do repositório:

```bash
cd frontend
npm ci
npm run dev:all
```

Abra **http://localhost:5173**. O comando usa `concurrently`, seguindo o [exemplo AraCoffee](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/FullStack/AraCoffee/Front/README.md#-rodando-os-dois-projetos-ao-mesmo-tempo): executa o Spring Boot no perfil `supabase` em **8080** e o Vite em **5173**, com prefixos `BACK` e `FRONT` no terminal. `Ctrl+C` encerra ambos; a saída de um dos processos também encerra o outro. Aguarde o backend concluir a conexão com o banco antes de entrar.

No Windows, `npm run dev:all:windows` é um alias do mesmo comando. Para selecionar o JDK nesta máquina pelo PowerShell, por exemplo:

```powershell
$env:JAVA_HOME = 'C:/Program Files/Java/jdk-25.0.3'
npm run dev:all
```

Para executar os serviços em terminais separados, use `npm run back` e `npm run dev`, ambos na pasta `frontend`. Não inicie outra instância nas mesmas portas. O backend também pode ser iniciado diretamente com os comandos do seu README.

### Endereços da API

Os padrões dispensam configuração adicional. Para substituí-los, copie [`.env.example`](.env.example) para `.env.local`:

```dotenv
VITE_API_URL=/api
BACKEND_URL=http://localhost:8080
```

O Vite encaminha `/api` ao backend em desenvolvimento e no preview. `BACKEND_URL` é usado pelo processo do Vite; `VITE_API_URL` é incorporado ao JavaScript do navegador. Nunca coloque senha de banco, chave administrativa ou outro segredo em variáveis `VITE_*`. Reinicie o Vite após alterar o ambiente.

Entre com usuário e senha cadastrados. As [contas fictícias de teste](../docs/database.md) permitem acessar os diferentes perfis. Novas instituições ficam inativas até validação administrativa; o formulário público não permite ativá-las.

```bash
npm run lint
npm run build
npm run preview
```

O preview usa a porta **5173**; encerre o Vite de desenvolvimento antes de iniciá-lo e mantenha o backend disponível. `npm run format` formata o código e os arquivos locais de apoio.

Na hospedagem, sirva `dist/index.html` como fallback das rotas da aplicação e encaminhe `/api` ao Spring Boot por um proxy reverso. O proxy de desenvolvimento do Vite não faz parte do build. Prefira frontend e API na mesma origem HTTPS, habilitando `ALLOCAR_COOKIE_SECURE=true` no backend. Para origens distintas, configure `VITE_API_URL` antes do build e as origens exatas em `ALLOCAR_ALLOWED_ORIGINS`; cookies também precisam respeitar a política SameSite do backend.

## Hospedagem

A [configuração de hospedagem Vercel + Render](../docs/deploy.md) descreve o proxy de produção, as variáveis e a publicação dos dois serviços. No Vercel, selecione a pasta `frontend` e configure `BACKEND_URL` com a origem HTTPS da API Render; `vercel.mjs` mantém o consumo em `/api`.

## Organização

```text
src/
├── api/              # cliente HTTP, CSRF, erros e endpoints REST
├── assets/brand/     # assinatura oficial em SVG
├── assets/figma/     # ícones e fotografias originais
├── components/
│   ├── layout/       # cabeçalho, rodapé, navegação, colunas e painéis
│   ├── rental/       # automóveis, etapas, proposta e ações autorizadas
│   └── ui/           # botões, campos, cartões, carregamento e feedback
├── data/             # apresentação, exemplos da landing e mapa dos quadros
├── pages/            # composição das interfaces e formulários por fluxo
├── state/            # sessão, rascunho, leituras canceláveis e mutações
└── styles/           # export do Figma, tokens CSS e composição
```

## Consumo da API

`api/client.js` centraliza `fetch` com `credentials: 'include'`, timeout, cancelamento de leituras, parâmetros de consulta e tradução dos erros HTTP. A sessão usa cookie `HttpOnly`; senhas, cookies e tokens não são gravados em `localStorage` ou `sessionStorage`. `AppProvider` recupera a conta por `/auth/me` ao recarregar a página e limpa o rascunho ao sair ou perder a sessão.

Antes de uma escrita, o cliente obtém `/auth/csrf` e envia o cabeçalho indicado pelo servidor. O token é renovado após login e descartado ao sair ou receber `403`. As operações de escrita nunca são repetidas automaticamente. Botões de envio ficam desabilitados enquanto a requisição está pendente.

`RequireSession` protege as rotas e preserva o destino do login. As áreas institucionais exigem `EMPRESA` ou `BANCO`; concessão e associação de crédito exigem `BANCO`. A autorização definitiva e o escopo dos registros são verificados pelo backend. Uma resposta `401` encerra a sessão da interface; `403`, `404`, `422`, erros de campos e indisponibilidade são apresentados na própria tela.

Os formulários enviam `versao`, `versaoPedido` e `versaoCadastro` recebidas do servidor, conforme a operação. Um conflito `409` permite recarregar os dados e revisar o formulário antes de enviar novamente. O histórico conserva pareceres anteriores e identifica o parecer utilizado na execução. Alterações cadastrais e de proposta exigem nova análise; o frontend não calcula aprovação por renda.

As listas usam a paginação e os filtros da API. Seletores percorrem todas as páginas necessárias. Os links usam os UUIDs retornados; números de pedido, contrato e crédito servem para apresentação.

### Fluxos

- **Cliente:** cadastro e login; consulta e edição da identificação e endereço; inclusão, alteração e remoção de até três vínculos; desativação da conta; busca e consulta de automóveis; criação, revisão, alteração, reenvio e cancelamento de pedidos; consulta de pareceres, contratos e crédito associado.
- **Empresa ou banco responsável:** fila com filtros; consulta de dados e rendimentos; alteração de proposta; decisão financeira com justificativa; consulta do histórico; execução do contrato após aprovação vigente.
- **Banco concedente:** registro de concessão de crédito; seleção de crédito livre e associação a contrato executado; consulta do recibo. O identificador de um contrato apresentado ao banco pode ser informado mesmo antes de ele estar disponível para consulta nesse escopo. Conceder e associar são operações separadas.

O catálogo fornece matrícula, marca, modelo, ano, placa e proprietário. O valor total é informado na proposta; o sistema não calcula tarifas diárias nem disponibilidade por período. Fotografias são usadas quando correspondem ao modelo, com apresentação neutra para os demais. As categorias e diárias da landing são exemplos comerciais explicitamente ilustrativos e não preenchem pedidos.

## Padrões de layout

`Header` compartilha a logo de 118 px, destaca a seção atual e apresenta nome e navegação da conta autenticada. O menu móvel fecha por Escape e devolve o foco ao botão. `Footer` mantém Ajuda e Documentos. `AppOverlays` reúne diálogos nativos com foco modal e fechamento por Escape.

`PageLayout` compõe `ProgressSteps` nas telas de aluguel: o fluxo de solicitação apresenta automóvel, período/contrato, revisão e envio; o acompanhamento usa o estado real do pedido para apresentar análise, aprovação, execução, cancelamento ou reprovação. Os layouts se reorganizam em telas estreitas; a tabela do agente tem rolagem própria.

## Design system em código

`src/styles/figma.tokens.json` preserva IDs, coleções, aliases e valores de **93 variáveis visuais**, **53 estilos de texto** e **3 estilos de sombra**. Os componentes reutilizam `styles/tokens.css`, incluindo os aliases semânticos de cor, espaçamento, raio e tipografia. A fonte Inter é distribuída localmente por `@fontsource/inter`.

Com os scripts locais de exportação disponíveis:

```bash
npm run tokens
node scripts/generate-tokens.mjs --check
```

## Rotas e referências

`:id` representa o UUID do recurso indicado na rota.

| Quadro | Interface | Rota |
| --- | --- | --- |
| AF00 / AF00M | Landing desktop / móvel | `/` |
| AF01 / AF14 | Acesso e erro real de autenticação | `/entrar` |
| AF02 | Cadastro de cliente | `/cadastro` |
| AF03 | Perfil e rendimentos | `/meu-cadastro` |
| AF04 | Meus pedidos | `/pedidos` |
| AF05 | Novo pedido | `/pedidos/novo` |
| AF06 | Detalhe e acompanhamento | `/pedidos/:id` |
| AF07 | Alterar pedido | `/pedidos/:id/alterar` |
| AF08 | Confirmar cancelamento | `/pedidos/:id/cancelar` |
| AF09 | Consulta do cancelamento | `/pedidos/:id/cancelado` |
| AF10 | Central do agente | `/agente` |
| AF11 | Análise financeira | `/agente/pedidos/:id/analise` |
| AF12 | Revisão do contrato aprovado | `/agente/pedidos/:id/aprovado` |
| AF13 | Consulta do parecer negativo | `/pedidos/:id/reprovado` |
| AF15 | Contrato em execução | `/contratos/:id/executado` |
| AF16 | Recibo de associação | `/agente/creditos/:id/associado` |
| AF17 / AF25 | Catálogo e resultado vazio do filtro | `/veiculos` |
| AF18 | Detalhe do automóvel | `/veiculos/:id` |
| AF19 | Resumo e revisão | `/pedidos/revisao` |
| AF20 | Consulta do pedido enviado | `/pedidos/:id/enviado` |
| AF21 | Meus contratos | `/contratos` |
| AF22 | Consulta do contrato | `/contratos/:id` |
| AF23 | Associação de crédito | `/agente/creditos/associar` |
| AF24 | Histórico de pareceres | `/agente/historico?pedido=:id` |
| AF26 | Créditos do banco | `/agente/creditos` |
| AF27 | Cadastro institucional | `/cadastro/instituicao` |
| — | Concessão de crédito | `/agente/creditos/novo` |
| — | Consulta de crédito | `/agente/creditos/:id` ou `/creditos/:id` |

`src/data/screens.js` relaciona rotas e IDs dos quadros; os contêineres expõem `data-figma-id`. Estados de erro, resultado vazio e confirmação dependem das respostas reais. Abrir uma URL de confirmação consulta o recurso, sem repetir a operação.

## Verificação

```bash
npm run lint
npm run build
```

Com a suíte local de navegador disponível:

```bash
npx playwright install chromium
npm run test:e2e
```

Os cenários HTTP controlados verificam sessão e CSRF, criação/edição/cancelamento, cadastro e vínculos, parecer/execução/crédito, permissões e falhas de concorrência. A inspeção visual percorre as interfaces em 1440, 768 e 390 px, verificando conteúdo, imagens, logo e ausência de overflow. A integração com PostgreSQL também pode ser verificada pelos [testes transacionais do backend](../backend/README.md), que encerram os cenários em rollback.
