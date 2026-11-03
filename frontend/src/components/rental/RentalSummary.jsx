import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { formatMoney, vehicleName } from '../../data/rental.js'

export default function RentalSummary({ vehicle, days, total, onSubmit, pending }) {
  return (
    <aside className="rental-summary">
      <h2>Resumo do pedido</h2>
      <p className="muted">
        {vehicleName(vehicle)} · {vehicle.ano}
      </p>
      <div className="rental-summary__line">
        <span>Duração solicitada</span>
        <span>{days} dias</span>
      </div>
      <div className="rental-summary__total">
        <strong>Valor total proposto</strong>
        <span>{formatMoney(total)}</span>
      </div>
      <small className="muted">
        Proposta sujeita à avaliação financeira pelo agente responsável.
      </small>
      <Button icon="arrowRight" onClick={onSubmit} disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar para análise'}
      </Button>
      <small className="rental-summary__assurance">
        <Icon name="shield" size={16} />O envio não executa o contrato.
      </small>
    </aside>
  )
}
