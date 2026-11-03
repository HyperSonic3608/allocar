import { createContext, useContext } from 'react'

export const AppContext = createContext(null)
export function useApp() {
  return useContext(AppContext)
}

export function emptyDraft() {
  return { vehicleId: '', start: '', end: '', contractType: 'PADRAO', total: '', agentId: '' }
}
