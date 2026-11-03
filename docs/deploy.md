# Hospedagem · Vercel e Render

Este guia descreve a publicação do frontend React no Vercel e da API Spring Boot/Java 25 no Render, com os dados no Supabase. O navegador acessa `/api` pelo domínio do frontend; o Vercel encaminha essas requisições ao contêiner Java no Render.

## Backend no Render

Na criação direta por MCP, os caminhos são relativos à raiz do repositório: `dockerfilePath=backend/Dockerfile` e `dockerContext=backend`, com Root Directory vazio. Isso equivale aos caminhos do Blueprint abaixo, que usa Root Directory `backend`. A origem da API é `https://allocar-backend.onrender.com`.

1. No Render, crie um **Blueprint** a partir deste repositório, usando `render.yaml` na raiz.
2. Confira o serviço `allocar-backend`, runtime Docker e Root Directory `backend`. O Dockerfile compila com Maven/JDK 25, executa os testes e inicia o JAR com JRE 25 e usuário sem privilégios.
3. Preencha as variáveis privadas solicitadas pelo Blueprint:

| Variável                  | Valor                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_DB_URL`         | URL JDBC do Session pooler, com `sslmode=require`.                                                                               |
| `SUPABASE_DB_USERNAME`    | Usuário dedicado da aplicação, no formato exigido pelo pooler.                                                                   |
| `SUPABASE_DB_PASSWORD`    | Senha do usuário dedicado.                                                                                                       |
| `ALLOCAR_ALLOWED_ORIGINS` | O Blueprint define `https://allocar.vercel.app`. Atualize se mudar o domínio; para mais de uma origem exata, separe por vírgula. |

O Blueprint define `SPRING_PROFILES_ACTIVE=supabase`, cookie seguro e pool com três conexões. `PORT` é fornecida pelo Render; o Spring escuta em `0.0.0.0` nessa porta. A verificação de saúde é `GET /api/health`: retorna apenas `{"status":"UP"}`, sem criar sessão ou expor dados do banco. A inicialização JDBC valida a conexão antes de liberar o serviço.

O Blueprint configura a sonda HTTP em `/api/health`. Se o serviço for criado diretamente por uma ferramenta que não aceita `healthCheckPath`, o Render usa sua sonda TCP padrão; para adotar a sonda HTTP, configure esse caminho nas configurações do serviço. O endpoint também pode ser consultado diretamente e através do proxy do Vercel.

O plano `free` está definido no Blueprint. Ele pode suspender a aplicação por inatividade; a retomada causa espera no primeiro acesso. Sessões ficam na memória desta única instância: suspensão, reinício e novo deploy encerram os logins. Para uso contínuo, escolha um plano adequado no Render; múltiplas instâncias exigem armazenamento compartilhado de sessão.

Use somente o login JDBC dedicado já utilizado pelo backend. Nunca copie arquivos `.env` para a imagem, use senha administrativa no serviço ou coloque credenciais no frontend. A imagem permite apenas `pom.xml` e `src` como entradas de build. O deploy não cria tabelas ou popula dados.

## Frontend no Vercel

1. Importe o repositório e selecione **Root Directory: `frontend`**, framework **Vite**, Node **22.x**.
2. Confira [`frontend/vercel.json`](../frontend/vercel.json): a regra `/api/:path*` deve ter `destination` igual a `https://allocar-backend.onrender.com/api/:path*`. Se mudar o backend, altere esse endereço no arquivo.
3. Mantenha `VITE_API_URL=/api` nos ambientes Production e Preview, ou deixe essa variável ausente para usar o padrão. As variáveis JDBC pertencem exclusivamente ao serviço Render.
4. O arquivo define instalação `npm ci`, build `npm run build`, saída `dist` e fallback das rotas React para `index.html`. Mantenha somente um arquivo de configuração Vercel no diretório `frontend`.
5. Inclua a origem HTTPS atribuída pelo Vercel em `ALLOCAR_ALLOWED_ORIGINS` no Render. Para previews autenticados, inclua a origem exata de cada preview e use um backend/banco de homologação quando necessário. Não libere todas as origens com cookies.

O proxy preserva o caminho `/api`, consultas, métodos e cookies. O cookie `JSESSIONID` não recebe um domínio fixo e é apresentado ao navegador pelo domínio do Vercel. As rotas da API usam `Cache-Control: private, no-store`; o fallback React exclui `/api` para preservar erros HTTP reais. O CSRF continua obrigatório nas operações de escrita.

`BACKEND_URL` controla apenas o proxy de desenvolvimento/preview local do Vite. A configuração estática do Vercel usa o endereço definido em `destination`; alterar uma variável com esse nome no painel não muda a regra hospedada.

Com a CLI autenticada, execute os comandos Vercel na raiz do repositório. A opção Root Directory `frontend` também é aplicada pela CLI. `vercel link` vincula o projeto; `vercel pull --yes --environment preview` recupera as configurações, e `vercel build` executa a compilação local. Mantenha `.vercel/` e os ambientes locais fora do Git. O [guia de preparação do agente](https://vercel.com/get-started.md) descreve CLI, skills/plugin e MCP.

### Publicação em produção

Confira se a branch de produção é `main`. Publique nessa branch o commit que contém `frontend/vercel.json`; a integração Git do Vercel usa esse conteúdo para o novo build. Se iniciar pelo painel, selecione esse commit em **Deployments → Create Deployment**. Repetir o deploy de um commit anterior usa os arquivos daquele commit.

Para publicar por CLI, na raiz do repositório, execute `vercel deploy --prod` depois de conferir o projeto vinculado e as configurações de Production. O comando `vercel deploy` sem `--prod` cria um preview. Publicações protegidas por autenticação Vercel exigem acesso à equipe correspondente.

### Diagnóstico de configuração

Se a validação indicar `rewrites[0]` sem `destination`, confira se o commit selecionado contém o JSON estático e a URL completa de destino. Remova configurações Vercel concorrentes e mantenha Root Directory `frontend`. Cada alteração no arquivo ou nas variáveis de build exige um novo deployment.

## Verificação após publicar

Confira `https://DOMINIO-DO-FRONT/api/health`, acesso direto a `/pedidos` e a recursos estáticos. Entre com uma conta de teste, consulte o catálogo e seus pedidos, recarregue a página e faça logout. Confira cookies `Secure`/`HttpOnly`, ausência de cache em respostas da API e retorno 401 ao consultar `/api/auth/me` após a saída. Verifique também CSRF, bloqueio por perfil e acesso pelo celular.

Para verificar o contêiner localmente:

```bash
docker build -t allocar-backend ./backend
```

Forneça as variáveis JDBC ao executar o contêiner. O arquivo local do backend usa Java properties e não deve ser convertido automaticamente em um `--env-file` Docker sem conferir sua sintaxe.

Referências: [configuração estática Vercel](https://vercel.com/docs/project-configuration/vercel-json), [rewrites](https://vercel.com/docs/routing/rewrites), [Blueprint Render](https://render.com/docs/blueprint-spec) e [Docker no Render](https://render.com/docs/docker).
