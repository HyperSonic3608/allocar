export const statusLabels = {
  EM_ANALISE: 'Em análise',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  CANCELADO: 'Cancelado',
  EM_EXECUCAO: 'Em execução',
}
export const statusTones = {
  EM_ANALISE: 'warning',
  APROVADO: 'success',
  REPROVADO: 'error',
  CANCELADO: 'error',
  EM_EXECUCAO: 'success',
}
export const terminal = (status) => ['CANCELADO', 'EM_EXECUCAO'].includes(status)
export const formatMoney = (value) =>
  value === null || value === undefined || value === ''
    ? 'Não informado'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
export const formatDate = (value) =>
  value ? value.slice(0, 10).split('-').reverse().join('/') : 'Não informado'
export const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(value),
      )
    : 'Não informado'
export const rentalDays = (start, end) =>
  start && end
    ? Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000)
    : 0
export const vehicleName = (vehicle) =>
  vehicle ? `${vehicle.marca} ${vehicle.modelo}` : 'Automóvel'
export const period = (order) => `${formatDate(order.inicio)} a ${formatDate(order.fim)}`
export const contractType = (type) =>
  type === 'COM_CREDITO' ? 'Aluguel com crédito' : 'Aluguel padrão'
export function vehiclePresentation(vehicle) {
  const model = vehicle.modelo.toLowerCase().replaceAll('-', '').replaceAll(' ', '')
  return {
    ...vehicle,
    name: vehicleName(vehicle),
    year: vehicle.ano,
    plate: vehicle.placa,
    registration: vehicle.matricula,
    image:
      model === 'onix' && vehicle.marca.toLowerCase() === 'chevrolet'
        ? '6461b.png'
        : model === 'tcross' && vehicle.marca.toLowerCase() === 'volkswagen'
          ? '096a0.png'
          : null,
  }
}
export function ownerName(id, agents = [], customer) {
  return agents.find((agent) => agent.id === id)?.nome || (customer?.id === id ? customer.nome : id)
}
export const emptyAddress = {
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: '',
}
export const journey = [
  ['Conta e cadastro', 'Mantenha identificação, endereço e rendimentos atualizados.'],
  ['Meus pedidos', 'Consulte o status e a proposta de cada solicitação.'],
  ['Pedido de aluguel', 'Escolha automóvel, agente, período e valor proposto.'],
  ['Análise financeira', 'O agente registra uma decisão justificada para a versão atual.'],
  ['Contrato', 'A execução exige aprovação financeira vigente.'],
]
export function permissions(account, detail) {
  const { pedido, cliente, pareceres } = detail
  const owner = account.tipo === 'CLIENTE' && account.parteId === pedido.clienteId
  const agent = account.tipo !== 'CLIENTE' && account.parteId === pedido.agenteResponsavelId
  const editable = !terminal(pedido.status)
  const approved =
    pedido.status === 'APROVADO' &&
    pareceres.some(
      (item) =>
        item.decisao === 'APROVADO' &&
        item.versaoPedido === pedido.versao &&
        item.versaoCadastro === cliente.versaoCadastro,
    )
  return {
    edit: editable && (owner || agent),
    cancel: editable && owner,
    analyze: agent && pedido.status === 'EM_ANALISE',
    execute: agent && approved,
    agent,
    owner,
  }
}
