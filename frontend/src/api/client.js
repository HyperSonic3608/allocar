const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
let csrf
let csrfRequest

export class ApiError extends Error {
  constructor(status, codigo, mensagem, campos = {}) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
    this.campos = campos
  }
}

export function resetCsrf() {
  csrf = undefined
  csrfRequest = undefined
}

export async function request(path, { method = 'GET', body, signal, anonymous = false } = {}) {
  const writing = !['GET', 'HEAD', 'OPTIONS'].includes(method)
  if (writing && !csrf) await renewCsrf()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  const abort = () => controller.abort(signal?.reason)
  if (signal?.aborted) abort()
  signal?.addEventListener('abort', abort, { once: true })
  try {
    const headers = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (writing) headers[csrf.headerName] = csrf.token
    const response = await fetch(`${base}${path}`, {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
    const data = response.status === 204 ? null : await response.json().catch(() => null)
    if (!response.ok) {
      if (response.status === 401 && !anonymous) {
        resetCsrf()
        window.dispatchEvent(new Event('allocar:session-expired'))
      }
      if (response.status === 403) resetCsrf()
      throw new ApiError(
        response.status,
        data?.codigo || 'FALHA_HTTP',
        data?.mensagem || 'Não foi possível concluir a operação.',
        data?.campos || {},
      )
    }
    if (response.status !== 204 && data === null)
      throw new ApiError(
        0,
        'RESPOSTA_INVALIDA',
        'O servidor retornou uma resposta inválida. Confira o endereço da API.',
      )
    return data
  } catch (error) {
    if (signal?.aborted || error instanceof ApiError) throw error
    throw new ApiError(
      0,
      'SEM_CONEXAO',
      controller.signal.aborted
        ? writing
          ? 'Não foi possível confirmar a operação a tempo. Consulte os registros antes de enviar novamente.'
          : 'O servidor demorou para responder. Tente novamente.'
        : writing
          ? 'A conexão foi interrompida. Consulte os registros antes de enviar novamente.'
          : 'Não foi possível acessar o servidor. Confira a conexão e tente novamente.',
    )
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

export async function renewCsrf() {
  csrfRequest ??= request('/auth/csrf', { anonymous: true })
    .then((data) => {
      if (!data?.token || !data?.headerName)
        throw new ApiError(0, 'SESSAO_INVALIDA', 'Não foi possível iniciar uma sessão segura.')
      csrf = data
      return data
    })
    .finally(() => {
      csrfRequest = undefined
    })
  return csrfRequest
}

export function query(params = {}) {
  const values = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (value !== '' && value !== null && value !== undefined) values.set(key, String(value))
  return values.size ? `?${values}` : ''
}

export async function all(path, { signal, ...filters } = {}) {
  const itens = []
  let pagina = 0
  let total
  do {
    const response = await request(`${path}${query({ ...filters, pagina, tamanho: 100 })}`, {
      signal,
    })
    itens.push(...response.itens)
    total = response.total
    pagina += 1
    if (!response.itens.length) break
  } while (itens.length < total)
  return itens
}

export const api = {
  me: (signal) => request('/auth/me', { signal, anonymous: true }),
  async login(credentials) {
    const account = await request('/auth/login', {
      method: 'POST',
      body: credentials,
      anonymous: true,
    })
    resetCsrf()
    await renewCsrf()
    return account
  },
  async logout() {
    await request('/auth/logout', { method: 'POST' })
    resetCsrf()
  },
  registerClient: (body) => request('/clientes', { method: 'POST', body, anonymous: true }),
  registerAgent: (body) => request('/agentes', { method: 'POST', body, anonymous: true }),
  profile: (signal) => request('/clientes/me', { signal }),
  updateProfile: (body) => request('/clientes/me', { method: 'PUT', body }),
  addEmployment: (body) => request('/clientes/me/vinculos', { method: 'POST', body }),
  updateEmployment: (id, body) => request(`/clientes/me/vinculos/${id}`, { method: 'PUT', body }),
  deleteEmployment: (id, version) =>
    request(`/clientes/me/vinculos/${id}${query({ versaoCadastro: version })}`, {
      method: 'DELETE',
    }),
  deactivate: (version) =>
    request(`/clientes/me${query({ versaoCadastro: version })}`, { method: 'DELETE' }),
  vehicles: (filters, signal) => request(`/automoveis${query(filters)}`, { signal }),
  vehicle: (id, signal) => request(`/automoveis/${id}`, { signal }),
  agents: (signal) => all('/agentes', { signal }),
  orders: (filters, signal) => request(`/pedidos${query(filters)}`, { signal }),
  order: (id, signal) => request(`/pedidos/${id}`, { signal }),
  createOrder: (body) => request('/pedidos', { method: 'POST', body }),
  updateOrder: (id, body) => request(`/pedidos/${id}`, { method: 'PUT', body }),
  resend: (id, versao) => request(`/pedidos/${id}/reenvio`, { method: 'POST', body: { versao } }),
  cancel: (id, versao) =>
    request(`/pedidos/${id}/cancelamento`, { method: 'POST', body: { versao } }),
  decisions: (id, signal) => request(`/pedidos/${id}/pareceres`, { signal }),
  evaluate: (id, body) => request(`/pedidos/${id}/pareceres`, { method: 'POST', body }),
  execute: (id, versao) => request(`/pedidos/${id}/contrato`, { method: 'POST', body: { versao } }),
  contracts: (filters, signal) => request(`/contratos${query(filters)}`, { signal }),
  contract: (id, signal) => request(`/contratos/${id}`, { signal }),
  credits: (filters, signal) => request(`/creditos${query(filters)}`, { signal }),
  credit: (id, signal) => request(`/creditos/${id}`, { signal }),
  grantCredit: (body) => request('/creditos', { method: 'POST', body }),
  associateCredit: (id, creditoId) =>
    request(`/contratos/${id}/credito`, { method: 'PUT', body: { creditoId } }),
}
