# AlloCar — API REST

## Execução e conexão

Configure as variáveis JDBC de `backend/.env` conforme o [guia do banco](database.md). Com JDK 25 e Maven, execute em `backend`:

```powershell
mvn spring-boot:run '-Dspring-boot.run.profiles=supabase'
```

URL local: **`http://localhost:8080/api`**. Requisições com corpo usam `Content-Type: application/json`. Datas usam `YYYY-MM-DD`; datas/horas das respostas usam UTC no formato ISO 8601. Identificadores são UUIDs. Valores e rendimentos são números decimais com até duas casas; taxa admite até seis casas.

O frontend acessa a API Spring Boot. Credenciais JDBC e funções privadas do Supabase permanecem no servidor.

## Sessão e CSRF

A autenticação utiliza o cookie de sessão `JSESSIONID`, `HttpOnly`, com expiração após 30 minutos sem atividade. Não é necessário armazenar tokens de autenticação em `localStorage` ou enviar identificadores de conta nos corpos das operações de negócio.

1. Faça `GET /auth/csrf` com cookies habilitados. A resposta contém `token` e `headerName`.
2. Envie esse token no cabeçalho `X-CSRF-TOKEN` de todo `POST`, `PUT` e `DELETE`, inclusive cadastro e login.
3. Faça `POST /auth/login` com usuário e senha. A sessão é renovada para impedir fixação de sessão.
4. Busque outro token em `GET /auth/csrf` após entrar: o token anterior é descartado.
5. Use `GET /auth/me` para recuperar o perfil. Faça `POST /auth/logout` para sair.

O token CSRF não substitui a autenticação. Uma sessão ausente/encerrada não autoriza operações de negócio. Contas inativas e instituições sem validação não podem entrar; a atividade da conta também é verificada nas transações das operações protegidas.

Exemplo de cliente para React/Vite:

```javascript
const base = 'http://localhost:8080/api'
let csrf

async function renovarCsrf() {
  const resposta = await fetch(`${base}/auth/csrf`, { credentials: 'include' })
  if (!resposta.ok) throw new Error('Não foi possível iniciar a sessão.')
  csrf = await resposta.json()
}

async function api(caminho, { method = 'GET', body } = {}) {
  const escrita = !['GET', 'HEAD', 'OPTIONS'].includes(method)
  if (escrita && !csrf) await renovarCsrf()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (escrita) headers[csrf.headerName] = csrf.token
  const resposta = await fetch(`${base}${caminho}`, {
    method, credentials: 'include', headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const dados = resposta.status === 204 ? null : await resposta.json()
  if (!resposta.ok) throw Object.assign(new Error(dados.mensagem), { status: resposta.status, dados })
  return dados
}

await renovarCsrf()
const conta = await api('/auth/login', {
  method: 'POST', body: { usuario: 'ana', senha: 'AlloCar@Teste2026' },
})
await renovarCsrf()
const pedidos = await api('/pedidos?pagina=0&tamanho=20')
// Ao sair: await api('/auth/logout', { method: 'POST' }); csrf = undefined
```

O exemplo usa uma [conta fictícia](database.md). Não registre senhas no console. Todas as chamadas precisam de `credentials: 'include'`. No desenvolvimento, use o mesmo nome de host para SPA e API, por exemplo `localhost` nos dois endereços.

## Rotas

As rotas da tabela são relativas a `/api`. Apenas obtenção de CSRF, login e criação de cliente/agente são públicas. Logout é tratado pelo Spring Security e requer CSRF. As demais exigem conta ativa.

| Método | Rota | Operação |
| --- | --- | --- |
| GET | `/auth/csrf` | Obter token CSRF. |
| POST | `/auth/login` | Entrar; retorna conta, titular, usuário, nome e tipo. |
| GET | `/auth/me` | Consultar o perfil autenticado. |
| POST | `/auth/logout` | Encerrar sessão; resposta 204. |
| POST | `/clientes` | Registrar cliente e conta ativa; resposta 201. |
| GET | `/clientes/me` | Consultar identificação, endereço, vínculos, renda total e versão cadastral. |
| PUT | `/clientes/me` | Atualizar identificação/endereço/profissão com versão esperada. |
| DELETE | `/clientes/me?versaoCadastro=N` | Desativar a própria conta e encerrar a sessão; preserva histórico; resposta 204. |
| POST | `/clientes/me/vinculos` | Adicionar vínculo; retorna perfil atualizado, resposta 201. |
| PUT | `/clientes/me/vinculos/{id}` | Atualizar vínculo próprio; retorna perfil atualizado. |
| DELETE | `/clientes/me/vinculos/{id}?versaoCadastro=N` | Remover vínculo próprio; retorna perfil atualizado. |
| POST | `/agentes` | Registrar empresa/banco inativo, sujeito a validação; resposta 201. |
| GET | `/agentes` | Listar instituições habilitadas para escolha do responsável pelo pedido. |
| GET | `/automoveis` | Listar catálogo com filtros opcionais `marca` e `ano`. |
| GET | `/automoveis/{id}` | Consultar identificação e proprietário do automóvel. |
| GET | `/pedidos` | Listar pedidos visíveis; filtro opcional `status`. |
| POST | `/pedidos` | Cliente cria pedido em análise; resposta 201 e `Location`. |
| GET | `/pedidos/{id}` | Consultar proposta, veículo, cliente/rendimentos, pareceres e contrato. |
| PUT | `/pedidos/{id}` | Cliente titular/agente responsável altera a proposta; exige versão. |
| POST | `/pedidos/{id}/reenvio` | Titular/agente responsável reenvia para análise; exige versão. |
| POST | `/pedidos/{id}/cancelamento` | Cliente titular cancela antes da execução; exige versão. |
| GET | `/pedidos/{id}/pareceres` | Consultar o histórico financeiro autorizado. |
| POST | `/pedidos/{id}/pareceres` | Agente responsável avalia proposta e cadastro vigentes; resposta 201. |
| POST | `/pedidos/{id}/contrato` | Agente executa contrato aprovado; resposta 201 e `Location`. |
| GET | `/contratos` | Listar contratos visíveis. |
| GET | `/contratos/{id}` | Consultar condições executadas e crédito associado. |
| PUT | `/contratos/{id}/credito` | Banco concedente associa crédito livre ao contrato executado. |
| GET | `/creditos` | Listar créditos visíveis, incluindo livres do próprio banco. |
| POST | `/creditos` | Banco registra uma concessão; resposta 201 e `Location`. |
| GET | `/creditos/{id}` | Consultar crédito autorizado. |

As listas de automóveis, agentes, pedidos, contratos e créditos aceitam `pagina` (início em 0) e `tamanho` (1 a 100, padrão 20). Elas retornam:

```json
{ "itens": [], "pagina": 0, "tamanho": 20, "total": 0 }
```

Histórico financeiro é uma lista de pareceres do pedido. Detalhes retornam 404 quando o recurso não existe ou não está visível à conta. O banco associado pode consultar o aluguel, mas apenas o cliente titular e o agente responsável podem modificar a proposta.

## Corpos e respostas

Os contratos completos de entrada/saída estão em [`ApiDtos.java`](../backend/src/main/java/com/allocar/backend/model/ApiDtos.java). Campos desconhecidos são recusados; não envie `contaId`, `clienteId`, `status`, `ativa`, `instituicaoValidada`, decisões ou condições contratuais fora dos campos documentados.

### Cadastro de cliente

```json
{
  "usuario": "cliente.exemplo",
  "senha": "uma-senha-com-12-ou-mais-caracteres",
  "nome": "Cliente Exemplo",
  "rg": "RG-EXEMPLO",
  "cpf": "123.456.789-01",
  "profissao": "Analista",
  "endereco": {
    "logradouro": "Rua Exemplo", "numero": "100", "complemento": "",
    "bairro": "Centro", "cidade": "São Paulo", "uf": "SP", "cep": "01000-000"
  },
  "vinculos": [{ "empregador": "Empresa Exemplo", "rendimento": 4500.00 }]
}
```

`vinculos` é obrigatório e admite uma lista vazia ou até três elementos. Usuário aceita letras, números, ponto, sublinhado e hífen, entre 3 e 120 caracteres; senha tem entre 12 e 256 caracteres. O servidor normaliza usuário para minúsculas. Nenhuma resposta inclui senha ou hash.

Para cadastrar agente, envie `usuario`, `senha`, `nome`, `cnpj`, `tipo` (`EMPRESA` ou `BANCO`) e `endereco`. A resposta de cadastro contém `contaId`, `parteId`, `usuario`, `tipo` e `ativa`. Novas instituições retornam `ativa: false`; validação e ativação são administrativas no Supabase, sem rota pública de promoção de privilégios.

### Atualização de cliente e vínculos

`PUT /clientes/me` recebe `versaoCadastro`, `nome`, `rg`, `cpf`, `profissao` e `endereco`. As operações POST/PUT de vínculo recebem:

```json
{ "versaoCadastro": 1, "empregador": "Empresa Exemplo", "rendimento": 4500.00 }
```

Use sempre a `versaoCadastro` retornada pelo último perfil consultado/atualizado. O contador pode avançar mais de uma unidade ao atualizar dados relacionados; não calcule a próxima versão no frontend.

### Pedido

`POST /pedidos`:

```json
{
  "agenteResponsavelId": "20000000-0000-0000-0000-000000000001",
  "proposta": {
    "automovelId": "60000000-0000-0000-0000-000000000001",
    "inicio": "2026-12-10", "fim": "2026-12-15",
    "tipo": "PADRAO", "valorTotal": 1250.00
  }
}
```

Escolha os IDs pelo catálogo e pela lista de agentes. Os IDs do exemplo identificam registros fictícios. O período precisa terminar após o início. Tipos: `PADRAO` e `COM_CREDITO`. O preço é uma proposta sujeita à análise do agente; não representa cobrança ou tarifa calculada automaticamente.

`PUT /pedidos/{id}` recebe `versao` e `proposta`. Reenvio, cancelamento e execução de contrato recebem `{ "versao": 1 }`. `CANCELADO` e `EM_EXECUCAO` são terminais. A API não oferece exclusão física de pedidos, pareceres ou contratos.

O detalhe contém `pedido`, `automovel`, `cliente`, `pareceres` e `contrato` (nulo antes da execução). O objeto `pedido` inclui `id`, `numero`, `clienteId`, `agenteResponsavelId`, `automovelId`, `inicio`, `fim`, `tipo`, `valorTotal`, `status` e `versao`.

### Avaliação, contrato e crédito

`POST /pedidos/{id}/pareceres`:

```json
{
  "versaoPedido": 1, "versaoCadastro": 2,
  "decisao": "APROVADO", "justificativa": "Dados e rendimentos analisados."
}
```

Decisão aceita `APROVADO` ou `REPROVADO`, com justificativa obrigatória. Ambas as versões vêm do detalhe consultado. Alterações posteriores de proposta ou cadastro invalidam a aprovação, preservando as cópias históricas do parecer.

Execução usa apenas a versão esperada. Tipo, valor, proprietário e parecer são obtidos pelo servidor a partir da proposta aprovada. Não há transferência automática de propriedade.

`POST /creditos` recebe `{ "numero": "CR-EXEMPLO", "valor": 1250.00, "taxa": 1.5 }`. Valor deve ser positivo; taxa não pode ser negativa. O número identifica uma concessão única. A taxa é um valor contratual informado pelo banco, sem cálculo de parcelas ou periodicidade presumida.

`PUT /contratos/{id}/credito` recebe `{ "creditoId": "UUID-do-credito" }`. Apenas o banco concedente pode associar; o contrato precisa ter sido executado e ambos os vínculos precisam estar livres. O banco pode informar o UUID de um contrato executado que lhe foi apresentado para financiamento; após a associação, passa a ter acesso à consulta do aluguel. Associar não aprova nem executa o pedido.

## Erros

```json
{
  "status": 409,
  "codigo": "VERSAO_DESATUALIZADA",
  "mensagem": "Os dados foram alterados; recarregue antes de continuar.",
  "campos": {}
}
```

| HTTP | Situação |
| --- | --- |
| 400 | JSON, campos, UUID, enumeração ou parâmetros inválidos. `campos` identifica validações de entrada quando disponíveis. |
| 401 | Credencial inválida, sessão ausente ou conta sem acesso ativo. |
| 403 | Perfil/escopo sem permissão ou CSRF ausente/inválido. Uma escrita sem CSRF pode receber 403 antes da autenticação. |
| 404 | Recurso inexistente ou invisível à conta. |
| 409 | Versão desatualizada, registro/vínculo duplicado ou conflito concorrente. |
| 422 | Violação de regra: limite de vínculos, estado terminal, falta de aprovação ou referência inválida. |
| 503 | Indisponibilidade temporária do banco. |
| 500 | Falha interna sem detalhes de SQL, credenciais ou pilha de execução. |

Em conflito de versão, recarregue os dados e apresente as mudanças ao usuário antes de reenviar. Não repita automaticamente criação de pedido, parecer ou contrato. Em 401, limpe o estado de usuário do frontend. Após logout ou nova sessão, obtenha outro CSRF antes de escrever.

## Configuração do navegador

O [frontend React](../frontend/README.md) usa `src/api/client.js` como consumidor deste contrato: sessão por cookie, renovação de CSRF após login, paginação, DTOs e versões esperadas. `npm run dev:all`, executado na pasta `frontend`, inicia Vite e Spring Boot; o proxy do Vite encaminha `/api` para `http://localhost:8080`. Em produção, esse encaminhamento deve ser configurado no servidor de hospedagem.

`ALLOCAR_ALLOWED_ORIGINS` aceita uma lista de origens separadas por vírgula. O padrão permite `http://localhost:5173` e `http://127.0.0.1:5173`, com cookies. Evite misturar esses dois hosts entre API e frontend. CORS não concede acesso a dados sem autenticação.

Em HTTPS, configure `ALLOCAR_COOKIE_SECURE=true`. O cookie usa `SameSite=Lax`; hospede frontend e API no mesmo site ou utilize um proxy da aplicação. Sessões ficam no servidor e são encerradas quando a instância é reiniciada; múltiplas instâncias exigem armazenamento compartilhado de sessão ou afinidade.

## Testes

```powershell
cd backend
mvn test

# Integração opt-in com o projeto Supabase configurado em .env
mvn '-Dtest=SupabaseApiIT' test
```

A suíte padrão verifica domínio, autenticação e contratos HTTP sem conectar ao banco remoto. A integração adicional usa o login JDBC dedicado, a cadeia de segurança e as tabelas reais; cria registros exclusivos dentro de transações com rollback ao fim de cada cenário. Não desativa triggers ou políticas RLS nem modifica registros de demonstração existentes.
