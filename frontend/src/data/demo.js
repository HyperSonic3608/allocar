export const vehicles = [
  {
    id: 'onix',
    name: 'Chevrolet Onix',
    brand: 'Chevrolet',
    model: 'Onix',
    year: '2025',
    plate: 'ABC1D23',
    registration: 'MAT-001',
    category: 'Compacto',
    group: 'Grupo C · Compacto',
    image: '6461b.png',
    daily: 250,
    landingDaily: 149.9,
    originalDaily: 179.9,
  },
  {
    id: 'tcross',
    name: 'Volkswagen T-Cross',
    brand: 'Volkswagen',
    model: 'T-Cross',
    year: '2025',
    plate: 'DEF4G56',
    registration: 'MAT-002',
    category: 'SUV',
    group: 'Grupo G · SUV',
    image: '096a0.png',
    daily: 250,
    landingDaily: 239.9,
  },
]

export const journey = [
  ['Conta / Perfil', 'Revise dados, permissões e documentos vinculados à sua conta.'],
  ['Meus pedidos', 'Acompanhe status, datas e agências vinculadas ao seu pedido.'],
  ['Pedido de aluguel', 'Escolha veículo, agência e período antes de avançar para a análise.'],
  ['Análise financeira', 'Confira documentos e condições antes da liberação do contrato.'],
  ['Contrato', 'O contrato só pode ser executado com aprovação positiva da versão atual.'],
]

export const formatMoney = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
export const formatDate = (value) => value.split('-').reverse().join('/')
export const parseMoney = (value) =>
  Number(
    String(value)
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=.*[,])/g, '')
      .replace(',', '.'),
  ) || 0
export const rentalDays = (start, end) =>
  Math.max(
    1,
    Math.round((new Date(`${end}T12:00:00`) - new Date(`${start}T12:00:00`)) / 86400000) || 5,
  )

export const modalContent = {
  decisao: {
    id: '62:2542',
    title: 'Decisão financeira',
    description:
      'Selecione uma decisão para a versão 1 do pedido #AL-001. A justificativa abaixo é um exemplo editável no arquivo de design.',
  },
  'decisao-obrigatoria': {
    id: '62:2554',
    title: 'Escolha uma decisão',
    description:
      'Selecione aprovar ou reprovar e confira a justificativa antes de salvar o parecer.',
    close: 'Voltar à análise',
  },
  'pedido-aprovado': {
    id: '62:2560',
    title: 'Pedido #AL-002 · Aprovado',
    description:
      'Volkswagen Polo 2025 · 18/12/2026 a 20/12/2026. A aprovação financeira da versão atual não significa que o contrato esteja em execução.',
    close: 'Voltar aos meus pedidos',
  },
  contrato: {
    id: '62:2566',
    title: 'Contrato CT-001 · Em execução',
    description:
      'Pedido #AL-001 · Ana Silva · Fiat Argo 2025 · ABC1D23 · MAT-001. Período: 10/12/2026 a 15/12/2026. Valor: R$ 1.250,00. Proprietário: Empresa Exemplo.',
    close: 'Voltar ao contrato em execução',
  },
  creditos: {
    id: '62:2572',
    title: 'Créditos associados · Hyper Banco',
    description:
      'CR-001 · R$ 1.250,00 · taxa proposta 1% a.m. · pedido #AL-001. Somente o banco concedente registra e associa este crédito.',
  },
  'pedido-carlos': {
    id: '62:2581',
    title: 'Pedido #AL-003 · Carlos Lima',
    description:
      'Volkswagen Polo · renda mensal declarada R$ 4.500,00 · versão 1 · em análise. O fluxo demonstrativo completo de parecer está no pedido #AL-001.',
    close: 'Voltar à fila',
  },
  ajuda: {
    id: '62:2587',
    title: 'Como acompanhar seu aluguel',
    description:
      'Consulte seus pedidos, revise seus dados de cadastro e acompanhe o status da análise. A execução do contrato exige parecer positivo da versão atual.',
    close: 'Fechar ajuda',
  },
  documentos: {
    id: '62:2593',
    title: 'Documentos do aluguel',
    description:
      'Consulte os dados do pedido e o contrato após sua execução. Para revisar sua identificação e rendimentos, abra Meu perfil.',
  },
}
