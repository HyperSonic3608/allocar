import { createContext, useContext } from 'react'
import { modalContent } from '../data/demo.js'

export const PrototypeContext = createContext(null)
export function usePrototype() {
  return useContext(PrototypeContext)
}

export function initialState() {
  const panel = new URLSearchParams(window.location.search).get('painel')
  return {
    profile: null,
    vehicleId: 'onix',
    start: '2026-12-10',
    end: '2026-12-15',
    contractType: 'PADRAO',
    status: 'EM_ANALISE',
    version: 1,
    decision: '',
    justification: '',
    executed: false,
    associated: false,
    modal: modalContent[panel] ? panel : null,
    toast: null,
    customer: {
      name: 'Ana Silva',
      occupation: 'Analista de sistemas',
      address: 'Rua Exemplo, 100 · Belo Horizonte/MG',
      employers: ['Empresa Exemplo', '', ''],
      incomes: ['R$ 6.000,00', '', ''],
    },
    credit: { number: 'CR-001', bank: 'Hyper Banco', value: 'R$ 1.250,00', rate: '1% ao mês' },
  }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...initialState(), profile: action.profile, modal: null }
    case 'LOGOUT':
      return { ...initialState(), modal: null }
    case 'VEHICLE':
      return { ...state, vehicleId: action.id }
    case 'DRAFT':
      return { ...state, ...action.values }
    case 'SEND':
      return { ...state, status: 'EM_ANALISE', decision: '', justification: '' }
    case 'EDIT':
      return {
        ...state,
        ...action.values,
        version: state.version + 1,
        status: 'EM_ANALISE',
        decision: '',
        justification: '',
      }
    case 'CANCEL':
      return { ...state, status: 'CANCELADO' }
    case 'DECISION':
      return {
        ...state,
        decision: action.value,
        justification:
          action.value === 'APROVADO'
            ? 'Renda informada compatível com a proposta de R$ 1.250,00. Cadastro e vínculos de renda conferidos.'
            : 'Informações de renda insuficientes para a proposta.',
        modal: null,
      }
    case 'JUSTIFICATION':
      return { ...state, justification: action.value }
    case 'SAVE_DECISION':
      return { ...state, status: state.decision }
    case 'EXECUTE':
      return { ...state, status: 'EM_EXECUCAO', executed: true }
    case 'ASSOCIATE':
      return { ...state, associated: true, credit: action.values }
    case 'CUSTOMER':
      return {
        ...state,
        customer: action.values,
        status: state.executed || state.status === 'CANCELADO' ? state.status : 'EM_ANALISE',
        decision: '',
        justification: '',
        toast: 'Cadastro atualizado.',
      }
    case 'MODAL':
      return { ...state, modal: action.name }
    case 'TOAST':
      return { ...state, toast: action.message }
    default:
      return state
  }
}
