import { Navigate, Outlet, useLocation } from 'react-router'
import { useApp } from '../state/app-context.js'
import PageLayout from './layout/PageLayout.jsx'
import { ErrorMessage } from './ui/ResourceState.jsx'
import { Note } from './ui/Feedback.jsx'
import Button from './ui/Button.jsx'

export default function RequireSession({ roles }) {
  const { status, account, error, refreshSession } = useApp()
  const location = useLocation()
  if (status === 'loading')
    return (
      <PageLayout kind="public">
        <div role="status" className="resource-loading">
          Verificando sua sessão…
        </div>
      </PageLayout>
    )
  if (status === 'error')
    return (
      <PageLayout kind="public">
        <ErrorMessage error={error} onReload={refreshSession} />
      </PageLayout>
    )
  if (!account)
    return (
      <Navigate
        replace
        to={`/entrar?destino=${encodeURIComponent(location.pathname + location.search)}`}
      />
    )
  if (roles && !roles.includes(account.tipo))
    return (
      <PageLayout>
        <Note title="Área restrita ao perfil autorizado">
          Sua conta não possui permissão para esta operação.
        </Note>
        <Button to={account.tipo === 'CLIENTE' ? '/pedidos' : '/agente'}>
          Voltar à minha área
        </Button>
      </PageLayout>
    )
  return <Outlet />
}
