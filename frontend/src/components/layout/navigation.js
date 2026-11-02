export function accountArea(kind, profile) {
  if (kind === 'public' || kind === 'landing') return kind
  if (profile) return profile === 'CLIENTE' ? 'client' : 'agent'
  return kind
}

export const clientLinks = [
  ['Buscar veículos', '/veiculos'],
  ['Meus pedidos', '/pedidos'],
  ['Meus contratos', '/contratos'],
  ['Meu cadastro', '/meu-cadastro'],
]

export const agentLinks = [
  ['Central de pedidos', '/agente'],
  ['Histórico', '/agente/historico'],
  ['Contratos', '/contratos'],
  ['Créditos', '/agente/creditos'],
]

export const landingLinks = [
  ['Como funciona', '/#como-funciona'],
  ['Categorias', '/#categorias'],
  ['Dúvidas', '/#duvidas'],
]

export function activeLink(path, pathname, hash) {
  if (path.includes('#')) return `${pathname}${hash}` === path
  if (path === '/agente')
    return (
      pathname === path ||
      pathname.startsWith('/agente/pedidos/') ||
      pathname === '/pedidos' ||
      pathname.startsWith('/pedidos/')
    )
  return pathname === path || pathname.startsWith(`${path}/`)
}
