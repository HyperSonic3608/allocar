# Hospedagem · Vercel e Render

O frontend React é hospedado no Vercel, a API Spring Boot/Java 25 no Render e os dados permanecem no Supabase. O navegador acessa a API pelo mesmo domínio do frontend, em `/api`, usando o proxy externo do Vercel. Java não consta entre os [runtimes oficiais do Vercel](https://vercel.com/docs/functions/runtimes); o Render executa a API como contêiner Docker.

## Backend no Render

1. No Render, crie um **Blueprint** a partir deste repositório, usando `render.yaml` na raiz.
2. Confira o serviço `allocar-backend`, runtime Docker e Root Directory `backend`. O Dockerfile compila com Maven/JDK 25, executa os testes e inicia o JAR com JRE 25 e usuário sem privilégios.
3. Preencha as variáveis privadas solicitadas pelo Blueprint:

| Variável | Valor |
| --- | --- |
| `SUPABASE_DB_URL` | URL JDBC do Session pooler, com `sslmode=require`. |
| `SUPABASE_DB_USERNAME` | Usuário dedicado da aplicação, no formato exigido pelo pooler. |
| `SUPABASE_DB_PASSWORD` | Senha do usuário dedicado. |
| `ALLOCAR_ALLOWED_ORIGINS` | O Blueprint define `https://allocar.vercel.app`. Atualize se mudar o domínio; para mais de uma origem exata, separe por vírgula. |

O Blueprint define `SPRING_PROFILES_ACTIVE=supabase`, cookie seguro e pool com três conexões. `PORT` é fornecida pelo Render; o Spring escuta em `0.0.0.0` nessa porta. A verificação de saúde é `GET /api/health`: retorna apenas `{"status":"UP"}`, sem criar sessão ou expor dados do banco. A inicialização JDBC valida a conexão antes de liberar o serviço.

O plano `free` está definido no Blueprint. Ele pode suspender a aplicação por inatividade; a retomada causa espera no primeiro acesso. Sessões ficam na memória desta única instância: suspensão, reinício e novo deploy encerram os logins. Para uso contínuo, escolha um plano adequado no Render; múltiplas instâncias exigem armazenamento compartilhado de sessão.

Use somente o login JDBC dedicado já utilizado pelo backend. Nunca copie arquivos `.env` para a imagem, use senha administrativa no serviço ou coloque credenciais no frontend. A imagem permite apenas `pom.xml` e `src` como entradas de build. O deploy não cria tabelas ou popula dados.

## Frontend no Vercel

1. Importe o repositório e selecione **Root Directory: `frontend`**, framework **Vite**, Node **22.x**.
2. Defina `BACKEND_URL` com a origem HTTPS real fornecida pelo Render, por exemplo `https://seu-servico.onrender.com`, sem `/api`, parâmetros ou credenciais. Configure separadamente os ambientes Production e Preview.
3. Mantenha `VITE_API_URL=/api`, ou deixe essa variável ausente para usar o padrão. Não use a URL externa diretamente no JavaScript.
4. O arquivo `frontend/vercel.mjs` fornece instalação `npm ci`, build `npm run build`, saída `dist`, proxy `/api/:path*` e fallback das rotas React para `index.html`. O destino vem de `BACKEND_URL`; o arquivo recusa configuração ausente ou inválida. A variável é avaliada na configuração do deployment: alterações exigem outro deploy.
5. Inclua a origem HTTPS atribuída pelo Vercel em `ALLOCAR_ALLOWED_ORIGINS` no Render. Para previews autenticados, inclua a origem exata de cada preview e use um backend/banco de homologação quando necessário. Não libere todas as origens com cookies.

O proxy preserva o caminho `/api`, consultas, métodos e cookies. O cookie `JSESSIONID` não recebe um domínio fixo e é apresentado ao navegador pelo domínio do Vercel. As rotas da API usam `Cache-Control: private, no-store`; o fallback React exclui `/api` para preservar erros HTTP reais. O CSRF continua obrigatório nas operações de escrita.

Com a CLI autenticada, execute os comandos Vercel na raiz do repositório: o projeto já usa `Root Directory: frontend`, e essa opção também é aplicada pela CLI. `vercel link` vincula o projeto; o repositório conectado pode gerar deployments a cada push. `vercel env add BACKEND_URL production` e `vercel env add BACKEND_URL preview` configuram o destino. Depois, use `vercel pull --yes --environment preview` e `vercel build` para validar localmente. Nunca adicione credenciais Supabase ao Vercel. O [guia de preparação do agente](https://vercel.com/get-started.md) descreve CLI, skills/plugin e MCP.

## Verificação após publicar

Confira `https://DOMINIO-DO-FRONT/api/health`, acesso direto a `/pedidos` e a recursos estáticos. Entre com uma conta de teste, consulte o catálogo e seus pedidos, recarregue a página e faça logout. Confira cookies `Secure`/`HttpOnly`, ausência de cache em respostas da API e retorno 401 ao consultar `/api/auth/me` após a saída. Verifique também CSRF, bloqueio por perfil e acesso pelo celular.

Para verificar o contêiner localmente:

```bash
docker build -t allocar-backend ./backend
```

Forneça as variáveis JDBC ao executar o contêiner. O arquivo local do backend usa Java properties e não deve ser convertido automaticamente em um `--env-file` Docker sem conferir sua sintaxe.

Referências: [configuração programática Vercel](https://vercel.com/docs/project-configuration/vercel-ts), [rewrites](https://vercel.com/docs/routing/rewrites), [Blueprint Render](https://render.com/docs/blueprint-spec) e [Docker no Render](https://render.com/docs/docker).
