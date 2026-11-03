import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, resetCsrf } from '../api/client.js'
import { AppContext, emptyDraft } from './app-context.js'

export default function AppProvider({ children }) {
  const generation = useRef(0)
  const [session, setSession] = useState({ status: 'loading', account: null, error: null })
  const [revision, setRevision] = useState(0)
  const [draft, setDraft] = useState(emptyDraft)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const clearSession = useCallback(() => {
    generation.current += 1
    resetCsrf()
    setSession({ status: 'anonymous', account: null, error: null })
    setDraft(emptyDraft())
    setModal(null)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    const current = generation.current
    api
      .me(controller.signal)
      .then((account) => {
        if (!controller.signal.aborted && current === generation.current)
          setSession({ status: 'authenticated', account, error: null })
      })
      .catch((error) => {
        if (!controller.signal.aborted && current === generation.current)
          setSession({
            status: error.status === 401 ? 'anonymous' : 'error',
            account: null,
            error: error.status === 401 ? null : error,
          })
      })
    return () => controller.abort()
  }, [revision])
  useEffect(() => {
    window.addEventListener('allocar:session-expired', clearSession)
    return () => window.removeEventListener('allocar:session-expired', clearSession)
  }, [clearSession])
  const login = useCallback(async (credentials) => {
    const account = await api.login(credentials)
    generation.current += 1
    setSession({ status: 'authenticated', account, error: null })
    setDraft(emptyDraft())
    return account
  }, [])
  const logout = useCallback(async () => {
    await api.logout()
    clearSession()
  }, [clearSession])
  const refreshSession = useCallback(() => setRevision((value) => value + 1), [])
  const notify = useCallback((message, tone = 'success') => setToast({ message, tone }), [])
  const value = useMemo(
    () => ({
      ...session,
      draft,
      setDraft,
      modal,
      setModal,
      toast,
      setToast,
      notify,
      login,
      logout,
      clearSession,
      refreshSession,
    }),
    [session, draft, modal, toast, notify, login, logout, clearSession, refreshSession],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
