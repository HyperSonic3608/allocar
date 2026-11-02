import { useMemo, useReducer } from 'react'
import { PrototypeContext, initialState, reducer } from './prototype-store.js'

export default function PrototypeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
}
