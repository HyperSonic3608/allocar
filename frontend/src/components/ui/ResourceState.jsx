import Button from './Button.jsx'
import { Alert } from './Feedback.jsx'

export function ErrorMessage({ error, onReload }) {
  if (!error) return null
  return (
    <Alert
      tone="error"
      title={
        error.status === 409
          ? 'Os dados precisam ser atualizados'
          : error.status === 403
            ? 'Operação não autorizada'
            : error.status === 404
              ? 'Registro não encontrado'
              : 'Não foi possível concluir'
      }
    >
      <p>{error.message}</p>
      {Object.entries(error.campos || {}).length > 0 && (
        <ul className="validation-errors">
          {Object.entries(error.campos).map(([name, message]) => (
            <li key={name}>
              {name}: {message}
            </li>
          ))}
        </ul>
      )}
      {onReload && (
        <Button variant="secondary" onClick={onReload}>
          {error.status === 409 ? 'Recarregar dados' : 'Tentar novamente'}
        </Button>
      )}
    </Alert>
  )
}

export default function ResourceState({ resource, children }) {
  if (resource.loading)
    return (
      <div className="resource-loading" role="status" aria-live="polite">
        Carregando informações…
      </div>
    )
  if (resource.error) return <ErrorMessage error={resource.error} onReload={resource.reload} />
  return children(resource.data)
}

export function Pagination({ page, size, total, onChange }) {
  if (total <= size) return null
  return (
    <nav className="pagination" aria-label="Paginação">
      <Button variant="secondary" disabled={page === 0} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <span>
        Página {page + 1} de {Math.ceil(total / size)} · {total} registros
      </span>
      <Button
        variant="secondary"
        disabled={(page + 1) * size >= total}
        onClick={() => onChange(page + 1)}
      >
        Próxima
      </Button>
    </nav>
  )
}
