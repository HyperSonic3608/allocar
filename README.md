<p align="center">
    <img src="docs/allocar-logo.svg" alt="Logo AlloCar" width="320"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&amp;logo=react&amp;logoColor=20232A" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&amp;logo=vite&amp;logoColor=white" alt="Vite 8"/>
  <img src="https://img.shields.io/badge/Java-25-ED8B00?style=for-the-badge" alt="Java 25"/>
  <img src="https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?style=for-the-badge&amp;logo=springboot&amp;logoColor=white" alt="Spring Boot 4.1"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&amp;logo=supabase&amp;logoColor=white" alt="Supabase PostgreSQL"/>
</p>

---

Sistema web de aluguel de carros que conecta clientes, empresas e bancos na solicitação, análise financeira e contratação de aluguéis.

## 📚 Índice

- [Links úteis](#-links-úteis)
- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades principais](#-funcionalidades-principais)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Design system](#-design-system)
- [Arquitetura e diagramas](#-arquitetura)
- [Histórias de usuário](#-histórias-de-usuário)
- [Consulta dos artefatos](#-consulta-dos-artefatos)
- [Instalação e execução](#-instalação-e-execução)
- [Deploy](#-deploy)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Demonstração e protótipos](#-demonstração)
- [Testes e validação](#-testes-e-validação)
- [Documentações e referências](#-documentações-e-referências)
- [Autor](#-autor)
- [Contribuição](#-contribuição)
- [Agradecimentos](#-agradecimentos)
- [Licença](#-licença)

## 🔗 Links Úteis

| Recurso                                   | Acesso                                                                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Aplicação web                             | [allocar.vercel.app](https://allocar.vercel.app)                                                                                 |
| Repositório                               | [HyperSonic3608/allocar](https://github.com/HyperSonic3608/allocar)                                                              |
| Saúde da API                              | [Endpoint público no Render](https://allocar-backend.onrender.com/api/health)                                                    |
| Hospedagem e produção                     | [Vercel, Render, proxy e variáveis](docs/deploy.md)                                                                              |
| Requisitos, regras, estados e arquitetura | [Modelagem detalhada](docs/modelagem.md)                                                                                         |
| Histórias e critérios de aceitação        | [Histórias de usuário](docs/historias-de-usuario.md)                                                                             |
| Backend, execução e regras de negócio     | [Organização, modelo, operações e testes](backend/README.md)                                                                     |
| API REST e integração com o frontend      | [Rotas, autenticação e exemplos JSON](docs/api.md)                                                                               |
| Interface React e execução local          | [Componentes, tokens, rotas e comandos](frontend/README.md)                                                                      |
| Banco de dados e conexão                  | [Configuração, tabelas e dados fictícios](docs/database.md)                                                                      |
| Diagramas editáveis                       | [Fontes draw.io e prévias](docs/diagramas/)                                                                                      |
| Protótipos editáveis                      | [Arquivo Figma](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK)                                                             |
| Wireframes navegáveis                     | [Apresentar baixa fidelidade](https://www.figma.com/proto/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=4-1697&starting-point-node-id=4%3A1697) |
| Interface                                 | [Apresentar alta fidelidade](https://www.figma.com/proto/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=4-1017&starting-point-node-id=4%3A1017)  |
| Design system e componentes               | [Documentação e inventário](docs/design-system/README.md)                                                                        |

## 📝 Sobre o Projeto

O AlloCar centraliza pedidos de aluguel feitos pela Internet. Clientes cadastrados solicitam automóveis e consultam, alteram ou cancelam seus pedidos. Empresas e bancos atuam como agentes: modificam propostas, realizam análise financeira e dão continuidade aos contratos após parecer positivo.

O cadastro de cada cliente contempla RG, CPF, nome, endereço, profissão e até três entidades empregadoras com seus rendimentos. Automóveis possuem matrícula, ano, marca, modelo e placa, podendo pertencer a clientes, empresas ou bancos. Um aluguel também pode estar associado a crédito concedido por banco agente.

O contexto é acadêmico: o sistema reúne modelagem UML, prototipação, implementação de regras de domínio e integração entre uma interface React, uma API REST e um banco relacional.

## ✨ Funcionalidades Principais

- Cadastro prévio e login com usuário e senha para clientes e agentes.
- Cadastro do cliente com identificação, endereço, profissão e até três vínculos de renda.
- Criação, consulta, alteração e cancelamento de pedidos pelo cliente.
- Consulta e modificação de pedidos por agentes autorizados.
- Avaliação financeira com decisão, justificativa e versões da proposta e do cadastro.
- Execução de contrato condicionada à aprovação financeira vigente.
- Registro do proprietário do automóvel no contrato, preservando suas condições na execução.
- Associação opcional de crédito concedido por banco agente.

## 🛠 Tecnologias Utilizadas

| Área                     | Tecnologia                                                   |
| ------------------------ | ------------------------------------------------------------ |
| Modelagem UML            | draw.io / diagrams.net                                       |
| Prototipação             | Figma Design                                                 |
| Interface dos protótipos | Inter e design system nativo AlloCar                         |
| Documentação             | Markdown, SVG e PNG                                          |
| Frontend                 | React 19, React Router 8, Vite 8 e JavaScript com ES Modules |
| Estilização              | CSS, tokens do Figma e fonte Inter local                     |
| Backend                  | JDK 25 e Spring Boot 4.1.2                                   |
| Segurança                | Spring Security, sessão por cookie, CSRF e CORS              |
| Persistência             | Spring JDBC, HikariCP e transações                           |
| Build                    | Apache Maven                                                 |
| Banco de dados           | Supabase — PostgreSQL                                        |
| Arquitetura              | MVC                                                          |
| Hospedagem               | Vercel para o frontend e Render com Docker para a API        |

## 🖥️ Design System

O Figma possui quatro páginas: **Design System**, **Componentes nativos**, **Protótipo alta fidelidade** e **Wireframes**. A biblioteca própria reúne **65 famílias**: 43 componentes independentes e 22 conjuntos de variantes, incluindo logo, botões, campos, navegação, feedback, tabelas e padrões de locação.

As fundações possuem 57 variáveis primitivas, 29 semânticas, 53 estilos de texto Inter e três estilos de elevação. O acento principal é cítrico `#C5F34A`, com carvão `#18251F`, floresta `#145B50` e superfícies claras `#F5F6F2`. As coleções Interface e Wireframe reúnem outras 14 variáveis.

![Identidade e cores do design system AlloCar](docs/design-system/design-system.png)

A logo com carro integrado foi exportada diretamente do componente nativo, nas aplicações para [fundo claro](docs/allocar-logo-claro.svg), [fundo escuro](docs/allocar-logo.svg) e [monocromática](docs/allocar-logo-monocromatica.svg). Consulte o [design system](docs/design-system/README.md) para tokens, componentes, exemplos desktop/mobile e limites de escopo.

## 🏗 Arquitetura

O sistema usa um servidor central Spring Boot, com Controllers REST, serviços de aplicação, domínio e repositórios. O React + Vite constrói dinamicamente as páginas e consome a API por HTTPS/JSON. O servidor persiste os dados no PostgreSQL do Supabase e verifica autenticação e autorização em cada operação protegida.

Os dois subsistemas são **gestão de pedidos e contratos**, no back-end, e **construção dinâmica das páginas web**, no front-end. No MVC, a apresentação React representa a View; os Controllers expõem as operações; entidades, regras e persistência compõem o Model. Essa separação permite revisar interface e regras de negócio de forma independente.

### Diagramas UML

As imagens abaixo são prévias vetoriais das fontes editáveis. Para editar, abra o `.drawio` em [diagrams.net](https://app.diagrams.net/) usando **Arquivo → Abrir de → Dispositivo**.

#### Casos de uso

![Diagrama de casos de uso do AlloCar](docs/diagramas/casos-de-uso.svg)

[Fonte editável](docs/diagramas/casos-de-uso.drawio). Atores: visitante, cliente e agente, com especializações empresa e banco. Login e cadastro são públicos; todos os casos de negócio exigem autenticação.

#### Classes

![Diagrama de classes do AlloCar](docs/diagramas/classes.svg)

[Fonte editável](docs/diagramas/classes.drawio). O domínio relaciona conta, partes, cliente e rendimentos, agentes, automóvel, pedido, parecer, contrato e crédito. Multiplicidades explicitam o limite de três rendimentos, contrato único por pedido e crédito opcional.

#### Pacotes — visão lógica

![Diagrama de pacotes do AlloCar](docs/diagramas/pacotes.svg)

[Fonte editável](docs/diagramas/pacotes.drawio). Setas tracejadas representam dependências entre pacotes dos dois subsistemas.

### Decisões e premissas

O ciclo de vida do pedido compreende os estados `EM_ANALISE`, `APROVADO`, `REPROVADO`, `CANCELADO` e `EM_EXECUCAO`. Alterar a proposta ou o cadastro considerado na avaliação exige nova análise. Estados cancelados e em execução são terminais; executar um contrato exige aprovação das versões atuais da proposta e do cadastro. As [regras de domínio](docs/modelagem.md) detalham essas condições.

## 📖 Histórias de Usuário

| ID   | História                                                                                  | UC   |
| ---- | ----------------------------------------------------------------------------------------- | ---- |
| HU01 | Como visitante, quero cadastrar minha conta para obter acesso ao AlloCar.                 | UC01 |
| HU02 | Como usuário, quero entrar com usuário e senha para acessar as operações do meu perfil.   | UC02 |
| HU03 | Como cliente, quero manter meus dados e rendimentos para viabilizar a análise financeira. | UC03 |
| HU04 | Como cliente, quero solicitar um automóvel por um período para iniciar meu aluguel.       | UC04 |
| HU05 | Como cliente, quero consultar meus pedidos e status para acompanhar o atendimento.        | UC05 |
| HU06 | Como cliente, quero alterar meu pedido para corrigir a proposta antes da execução.        | UC06 |
| HU07 | Como cliente, quero cancelar meu pedido para desistir da solicitação.                     | UC07 |
| HU08 | Como agente, quero consultar a fila autorizada para organizar as análises.                | UC05 |
| HU09 | Como agente, quero emitir parecer financeiro para aprovar ou reprovar pedidos.            | UC08 |
| HU10 | Como agente, quero modificar pedidos autorizados para adequar a proposta.                 | UC09 |
| HU11 | Como agente, quero executar contratos aprovados para formalizar os aluguéis.              | UC10 |
| HU12 | Como banco, quero associar crédito concedido ao aluguel para registrar seu financiamento. | UC11 |

Os [critérios de aceitação, prioridades e vínculos com telas e classes](docs/historias-de-usuario.md) detalham cada história, inclusive fluxos alternativos e restrições por perfil.

## 🧐 Consulta dos Artefatos

Para consultar os artefatos:

1. Leia este README e a modelagem detalhada.
2. Abra os diagramas SVG pelo repositório ou as fontes `.drawio` no diagrams.net.
3. Abra uma apresentação no Figma e percorra os fluxos de cliente, agente e banco. Na análise, escolha aprovar ou reprovar antes de salvar.

## 🔧 Instalação e execução

### Pré-requisitos

Prepare as ferramentas e o acesso ao banco:

- Node.js 22.12 ou superior e npm
- JDK 25, com `JAVA_HOME` configurado, e Maven no `PATH`
- Git para obter o repositório
- Projeto Supabase com o schema privado `allocar` e o usuário JDBC dedicado

Confira as instalações com `node --version`, `java -version` e `mvn -version`. O Maven deve usar o JDK 25.

### Variáveis de ambiente

Copie `backend/.env.example` para `backend/.env` e preencha as credenciais do banco. O arquivo usa Java properties, sem aspas; siga o [guia de conexão](docs/database.md#conexão-do-backend).

| Local      | Variável                  | Finalidade                                              |
| ---------- | ------------------------- | ------------------------------------------------------- |
| Backend    | `SUPABASE_DB_URL`         | Conexão JDBC com TLS; use Session pooler em redes IPv4. |
| Backend    | `SUPABASE_DB_USERNAME`    | Usuário dedicado da aplicação.                          |
| Backend    | `SUPABASE_DB_PASSWORD`    | Senha privada desse usuário.                            |
| Backend    | `SUPABASE_DB_POOL_SIZE`   | Limite de conexões do pool, padrão 5.                   |
| Backend    | `ALLOCAR_ALLOWED_ORIGINS` | Origens exatas permitidas para o frontend.              |
| Backend    | `ALLOCAR_COOKIE_SECURE`   | `false` em HTTP local e `true` em HTTPS.                |
| Frontend   | `VITE_API_URL`            | Caminho público `/api`, também usado na hospedagem.     |
| Vite local | `BACKEND_URL`             | Destino do proxy local, padrão `http://localhost:8080`. |

As opções do frontend estão em `frontend/.env.example`; use `frontend/.env.local` para substituí-las. Credenciais JDBC ficam somente no backend. Variáveis `VITE_*` são públicas no navegador.

### Dependências e banco

Obtenha o código e instale as dependências do frontend:

```bash
git clone https://github.com/HyperSonic3608/allocar.git
cd allocar/frontend
npm ci
```

O Maven resolve as dependências Java ao executar o backend ou seus testes. O banco é administrado no Supabase: iniciar a aplicação não cria tabelas nem carrega dados. O [guia do banco](docs/database.md) descreve o schema, as permissões e as contas fictícias para testar os perfis.

### Executar os dois serviços

Na pasta `frontend`, execute:

```bash
npm run dev:all
```

Abra **http://localhost:5173**. O `concurrently` inicia Vite e Spring Boot no perfil `supabase`, com a API em **http://localhost:8080/api**. `Ctrl+C` encerra ambos; aguarde a conexão do backend antes de entrar.

Para usar terminais separados, execute `npm run back` e `npm run dev` na pasta `frontend`. Os [guias do frontend](frontend/README.md#execução) e do [backend](backend/README.md#execução) detalham os comandos e a seleção do JDK no PowerShell.

## 🚀 Deploy

O frontend usa o [Vercel](https://allocar.vercel.app), a API usa o [Render](https://allocar-backend.onrender.com/api/health) e o PostgreSQL permanece no Supabase. O navegador chama `/api` pelo domínio do frontend, e o proxy encaminha a requisição ao backend com cookies de sessão.

No Vercel, selecione Root Directory `frontend`, framework Vite e Node 22.x. `frontend/vercel.json` define instalação, build, saída `dist`, proxy e fallback das rotas React. O destino HTTPS do Render está no campo `destination`; `BACKEND_URL` é uma opção do proxy local do Vite.

No Render, use o Dockerfile do backend e forneça as variáveis JDBC privadas, as origens autorizadas e `ALLOCAR_COOKIE_SECURE=true`. O Blueprint `render.yaml` descreve essa configuração. Consulte o [roteiro de hospedagem](docs/deploy.md) para publicar, configurar saúde, revisar previews e validar autenticação.

## 📂 Estrutura de Pastas

```text
allocar/
├── README.md
├── frontend/
│   ├── src/
│   │   ├── assets/        # logo, ícones e fotografias do Figma
│   │   ├── api/           # cliente HTTP, CSRF e endpoints
│   │   ├── components/    # elementos de interface, layout e aluguel
│   │   ├── pages/         # composição das telas
│   │   ├── state/         # sessão, rascunho e requisições assíncronas
│   │   └── styles/        # tokens exportados e estilos reutilizáveis
│   ├── README.md
│   └── vercel.json        # build, proxy e rotas da hospedagem
├── backend/
│   ├── README.md
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/allocar/backend/
│       │   ├── application/   # BackendApplication.java
│       │   ├── controller/    # entrada HTTP
│       │   ├── exception/     # tradução de erros
│       │   ├── model/         # entidades e regras de negócio
│       │   ├── repository/    # persistência
│       │   └── service/       # casos de uso, transações e conexão JDBC
│       └── test/java/         # testes do backend
├── render.yaml                # configuração declarativa da API
└── docs/
    ├── allocar-logo.svg        # export oficial para fundo escuro
    ├── allocar-logo-claro.svg
    ├── allocar-logo-monocromatica.svg
    ├── modelagem.md
    ├── api.md
    ├── database.md
    ├── deploy.md
    ├── historias-de-usuario.md
    ├── design-system/          # tokens, inventário e prévias da biblioteca
    ├── diagramas/              # .drawio, XML nativo e prévias .svg
    └── prototipos/             # guia, prévias PNG e mapa de nós Figma
```

## 🎨 Demonstração

### Interface no navegador

```bash
cd frontend
npm ci
npm run dev:all
```

A interface React usa os componentes, tokens e ativos do Figma e consome a API REST para autenticação, cadastro, catálogo, pedidos, análise, contratos e crédito. Entre com uma conta cadastrada ou use os [perfis fictícios de teste](docs/database.md#dados-fictícios) para percorrer as áreas de cliente, empresa e banco.

O [guia de hospedagem](docs/deploy.md) descreve frontend no Vercel, backend Java no Render e acesso ao Supabase, com variáveis privadas, proxy e cookies de sessão.

### Landing page

A página inicial apresenta a AlloCar, explica as etapas do aluguel, mostra categorias de veículos e responde dúvidas frequentes. Os botões levam ao cadastro e ao acesso; os menus desktop rolam até as seções correspondentes. Há layouts desktop de **1440 px** e mobile de **390 px**, com logo, botões, cartões, metadados e acordeões nativos da biblioteca. As fotos foram reutilizadas dos assets existentes; os valores dos cartões são ilustrativos.

[Prévia desktop](docs/prototipos/landing-desktop.png) · [Prévia mobile](docs/prototipos/landing-mobile.png).

### Protótipos no Figma

Os protótipos apresentam **27 telas do sistema e duas aplicações da landing page em cada fidelidade**, além dos mapas da jornada. Os exemplos de busca de veículos e resumo da reserva do design system orientam a navegação, as superfícies, os filtros, os cartões e o resumo lateral.

| Conteúdo dos protótipos                                | Wireframes | Alta fidelidade |
| ------------------------------------------------------ | ---------- | --------------- |
| Telas do sistema                                       | 27         | 27              |
| Landing page — desktop e mobile                        | 2          | 2               |
| Painéis auxiliares                                     | 8          | 8               |
| Instâncias nas telas, incluindo aninhadas e landing    | 298        | 298             |
| Controles com clique, incluindo alternativas de estado | 270        | 270             |

A análise exige escolher aprovação ou reprovação antes de salvar. Os retornos da edição e da execução preservam o perfil cliente/agente. Os pedidos #AL-002 e #AL-003 e o contrato CT-001 possuem consultas auxiliares com dados correspondentes.

Os layouts usam cabeçalhos, hierarquia tipográfica, raios, superfícies e espaçamentos do design system. Cadastro, edição, detalhes e confirmações têm formulários em grade; a análise separa o contexto do pedido da decisão. Os wireframes reproduzem essa organização com tipografia simplificada, contornos retos, escala de cinza e marca textual. Os destinos de navegação permanecem na respectiva fidelidade.

| Baixa fidelidade                                                                       | Alta fidelidade                                                                       |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Estrutura em escala de cinza.                                                          | Logo, acento cítrico, cartões e componentes nativos AlloCar.                          |
| [Abrir wireframes](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=4-1697) | [Abrir interface](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=4-1017) |
| ![Prévia do painel em baixa fidelidade](docs/prototipos/baixa-fidelidade.png)          | ![Prévia do painel em alta fidelidade](docs/prototipos/alta-fidelidade.png)           |

Os protótipos cobrem login, cadastro, perfil e rendimentos, lista, novo pedido, detalhe/status, alteração, cancelamento, fila do agente, análise, contrato e crédito. A jornada também inclui busca com filtros e estado sem resultados, detalhe do automóvel, revisão, confirmação de envio, lista e detalhe de contratos, formulário e lista de créditos, histórico de pareceres e cadastro institucional.

[Abrir busca de veículos](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=92-2697) · [Abrir resumo do pedido](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=92-2699) · [Referências e decisões de escopo](docs/referencias-e-escopo.md).

| Busca de veículos                                              | Resumo do pedido                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| ![Busca com filtros e cartões](docs/prototipos/busca-alta.png) | ![Revisão com resumo lateral](docs/prototipos/resumo-alta.png) |

**Roteiros navegáveis:**

1. Cliente: login → busca → automóvel → período/tipo → resumo → enviar para análise → consultar status.
2. Alteração: detalhe → alterar → salvar e reenviar → em análise.
3. Cancelamento: detalhe → cancelar → confirmar → cancelado.
4. Agente: login como agente → fila → analisar → aprovar → contrato → executar.
5. Parecer negativo: fila → analisar → reprovar → justificativa → revisar pedido.
6. Banco: contrato → formulário de crédito → confirmar associação → consultar créditos.
7. Contratos: consultar lista vazia → executar após aprovação → consultar CT-001.

[Guia completo e links das telas](docs/prototipos/README.md). A escolha entre Onix e T-Cross acompanha o pedido; os filtros alternam resultados e a lista de contratos apresenta o aluguel após sua execução. A análise exige uma decisão, e o crédito distingue proposta de associação pelo banco concedente.

### Exemplo de resposta da API

O endpoint público de saúde permite conferir o acesso à API:

```bash
curl https://allocar-backend.onrender.com/api/health
```

Resposta JSON:

```json
{ "status": "UP" }
```

As operações de negócio exigem sessão e CSRF. O [guia HTTP](docs/api.md#sessão-e-csrf) apresenta a sequência de autenticação.

## 🧪 Testes e validação

Execute lint e compilação do frontend na pasta `frontend`:

```bash
npm run lint
npm run build
```

Na pasta `backend`, execute os testes de domínio, segurança e contratos HTTP:

```bash
mvn test
```

Para testar a persistência real no banco configurado em `backend/.env`, execute em `backend`:

```bash
mvn '-Dtest=SupabaseApiIT' test
```

Esses cenários criam dados exclusivos em transações com rollback. Os [testes do backend](backend/README.md#testes) e a [verificação do frontend](frontend/README.md#verificação) descrevem a cobertura e os recursos locais de navegador.

## 📚 Documentações e referências

As referências técnicas e de apresentação são:

- [React](https://react.dev/), [React Router](https://reactrouter.com/) e [Vite](https://vite.dev/)
- [Spring Boot](https://docs.spring.io/spring-boot/), [Spring Security](https://docs.spring.io/spring-security/reference/) e [Maven](https://maven.apache.org/guides/)
- [Supabase e conexões PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Vercel: rewrites](https://vercel.com/docs/routing/rewrites) e [Render: Docker](https://render.com/docs/docker)
- [diagrams.net](https://www.drawio.com/doc/) e [design system AlloCar no Figma](https://www.figma.com/design/BhQ1Hh0Rofd4t0k7EVWZgK?node-id=0-1)
- [Template de README da disciplina](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/TEMPLATES/template_README.md)
- [AraCoffee: execução conjunta](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/FullStack/AraCoffee/Front/README.md#-rodando-os-dois-projetos-ao-mesmo-tempo)
- [Localiza e Movida](docs/referencias-e-escopo.md), referências de organização da jornada de aluguel

## 👨‍💻 Autor

**Davi Sollar**

- GitHub: [HyperSonic3608](https://github.com/HyperSonic3608)
- LinkedIn: [linkedin.com/in/davisollar](https://linkedin.com/in/davisollar).

## 🤝 Contribuição

Para propor uma alteração:

1. Abra uma issue descrevendo o problema, comportamento esperado e passos para reprodução.
2. Prepare a alteração em uma branch e mantenha os componentes e tokens compartilhados.
3. Execute as verificações correspondentes e atualize a documentação afetada.
4. Abra um pull request com descrição, validação e capturas quando alterar interfaces.

Preserve as regras de autorização, a análise financeira por agente e o histórico dos contratos. Envie somente dados fictícios em exemplos e mantenha credenciais fora do código e das issues.

## 🙏 Agradecimentos

- Ao professor João Paulo Aramuni pelo material de referência e pelo template de documentação
- Às comunidades React, Spring, Supabase, diagrams.net e Figma pelas ferramentas e documentação

<!--## 📄 Licença

O repositório não inclui um arquivo de licença de software. Para condições de uso e redistribuição, entre em contato com o autor. Ferramentas, fontes e materiais de terceiros seguem as condições dos respectivos responsáveis.-->
