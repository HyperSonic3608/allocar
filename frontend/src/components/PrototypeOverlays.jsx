import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { usePrototype } from '../state/prototype-store.js'
import { modalContent } from '../data/demo.js'
import Button from './ui/Button.jsx'

export default function PrototypeOverlays() {
  const { state, dispatch } = usePrototype()
  const dialog = useRef(null)
  const navigate = useNavigate()
  const content = modalContent[state.modal]
  useEffect(() => {
    const element = dialog.current
    if (content && !element.open) element.showModal()
    if (!content && element.open) element.close()
  }, [content])
  useEffect(() => {
    if (!state.toast) return
    const timer = setTimeout(() => dispatch({ type: 'TOAST', message: null }), 5000)
    return () => clearTimeout(timer)
  }, [state.toast, dispatch])
  function close() {
    dispatch({ type: 'MODAL', name: null })
  }
  function go(to) {
    close()
    navigate(to)
  }
  return (
    <>
      <dialog
        ref={dialog}
        className="prototype-dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onCancel={close}
        onClick={(event) => {
          if (event.target === dialog.current) {
            const box = dialog.current.getBoundingClientRect()
            if (
              event.clientX < box.left ||
              event.clientX > box.right ||
              event.clientY < box.top ||
              event.clientY > box.bottom
            )
              close()
          }
        }}
      >
        {content && (
          <div className="prototype-dialog__content" data-figma-id={content.id}>
            <h2 id="dialog-title">{content.title}</h2>
            <p id="dialog-description">{content.description}</p>
            {state.modal === 'decisao' ? (
              <>
                <Button onClick={() => dispatch({ type: 'DECISION', value: 'APROVADO' })}>
                  Aprovar pedido
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: 'DECISION', value: 'REPROVADO' })}
                >
                  Reprovar pedido
                </Button>
                <Button variant="secondary" onClick={close}>
                  Voltar à análise
                </Button>
              </>
            ) : state.modal === 'creditos' ? (
              <>
                <Button onClick={() => go('/agente/creditos/CR-001/associado')}>
                  Consultar recibo de associação
                </Button>
                <Button variant="secondary" onClick={close}>
                  Voltar à fila
                </Button>
              </>
            ) : state.modal === 'documentos' ? (
              <>
                <Button onClick={() => go('/meu-cadastro')}>Abrir Meu perfil</Button>
                <Button variant="secondary" onClick={close}>
                  Fechar documentos
                </Button>
              </>
            ) : (
              <Button onClick={close}>{content.close}</Button>
            )}
          </div>
        )}
      </dialog>
      {state.toast && (
        <div className="toast" role="status">
          <span>{state.toast}</span>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => dispatch({ type: 'TOAST', message: null })}
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
