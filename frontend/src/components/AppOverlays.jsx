import { useEffect, useRef } from 'react'
import { useApp } from '../state/app-context.js'
import Button from './ui/Button.jsx'
import { formatMoney, period, vehicleName } from '../data/rental.js'

export default function AppOverlays() {
  const { modal, setModal, toast, setToast, account } = useApp()
  const dialog = useRef(null)
  useEffect(() => {
    if (modal && !dialog.current.open) dialog.current.showModal()
    if (!modal && dialog.current.open) dialog.current.close()
  }, [modal])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast, setToast])
  const close = () => setModal(null)
  const title =
    modal?.name === 'decisao'
      ? 'Decisão financeira'
      : modal?.name === 'documentos'
        ? 'Documentos do aluguel'
        : modal?.name === 'pedido'
          ? `Pedido ${modal.detail.pedido.numero}`
          : 'Como acompanhar seu aluguel'
  return (
    <>
      <dialog
        ref={dialog}
        className="prototype-dialog"
        aria-labelledby="dialog-title"
        onCancel={close}
        onClick={(event) => {
          if (event.target === dialog.current) {
            const bounds = dialog.current.getBoundingClientRect()
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              close()
          }
        }}
      >
        {modal && (
          <div className="prototype-dialog__content">
            <h2 id="dialog-title">{title}</h2>
            {modal.name === 'decisao' ? (
              <>
                <p>
                  Escolha a decisão para o pedido {modal.order.numero}, versão {modal.order.versao}.
                  Informe sua justificativa na análise e salve para registrar o parecer.
                </p>
                <Button
                  onClick={() => {
                    modal.onSelect('APROVADO')
                    close()
                  }}
                >
                  Aprovar pedido
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    modal.onSelect('REPROVADO')
                    close()
                  }}
                >
                  Reprovar pedido
                </Button>
                <Button variant="secondary" onClick={close}>
                  Voltar à análise
                </Button>
              </>
            ) : modal.name === 'documentos' ? (
              <>
                <p>
                  Consulte seus pedidos e os contratos executados. O histórico financeiro identifica
                  a versão e os dados considerados em cada parecer.
                </p>
                <Button to="/contratos" onClick={close}>
                  Consultar contratos
                </Button>
                {account?.tipo === 'CLIENTE' && (
                  <Button to="/meu-cadastro" variant="secondary" onClick={close}>
                    Conferir meu cadastro
                  </Button>
                )}
                <Button variant="secondary" onClick={close}>
                  Fechar documentos
                </Button>
              </>
            ) : modal.name === 'pedido' ? (
              <>
                <p>
                  {modal.detail.cliente.nome} · {vehicleName(modal.detail.automovel)}
                  <br />
                  {period(modal.detail.pedido)} · {formatMoney(modal.detail.pedido.valorTotal)}
                </p>
                <Button to={`/pedidos/${modal.detail.pedido.id}`} onClick={close}>
                  Consultar pedido
                </Button>
                <Button variant="secondary" onClick={close}>
                  Fechar consulta
                </Button>
              </>
            ) : (
              <>
                <p>
                  Consulte os pedidos da sua conta e acompanhe a análise financeira. Alterar uma
                  proposta exige nova análise; a execução do contrato depende de aprovação vigente.
                  A associação de crédito é opcional e exclusiva do banco concedente.
                </p>
                <Button onClick={close}>Fechar ajuda</Button>
              </>
            )}
          </div>
        )}
      </dialog>
      {toast && (
        <div className={`toast ${toast.tone === 'error' ? 'toast--error' : ''}`} role="status">
          <span>{toast.message}</span>
          <button type="button" aria-label="Fechar mensagem" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </>
  )
}
