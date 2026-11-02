import useRental from '../../state/useRental.js'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { useNavigate } from 'react-router'

export default function RentalSummary() {
  const { vehicle, days, price, dispatch } = useRental()
  const navigate = useNavigate()
  return (
    <aside className="rental-summary">
      <h2>Resumo do pedido</h2>
      <p className="muted">
        {vehicle.name} · {vehicle.year}
      </p>
      <div className="rental-summary__line">
        <span>{days} dias × R$ 250,00</span>
        <span>{price}</span>
      </div>
      <div className="rental-summary__total">
        <strong>Total estimado</strong>
        <span>{price}</span>
      </div>
      <small className="muted">Proposta ilustrativa, sujeita a parecer financeiro positivo.</small>
      <Button
        icon="arrowRight"
        onClick={() => {
          dispatch({ type: 'SEND' })
          navigate('/pedidos/AL-001/enviado')
        }}
      >
        Enviar para análise
      </Button>
      <small className="rental-summary__assurance">
        <Icon name="shield" size={16} />O envio não executa o contrato.
      </small>
    </aside>
  )
}

export function ProgressSteps() {
  return (
    <section className="progress-steps" aria-label="Etapas do pedido">
      <ol>
        {[
          ['Recebido', 'Concluído'],
          ['Em análise', 'Etapa atual'],
          ['Aprovação', 'A seguir'],
          ['Contrato', 'A seguir'],
        ].map(([title, caption], index) => (
          <li key={title} aria-current={index === 1 ? 'step' : undefined}>
            <span
              className={`progress-steps__number ${index < 2 ? 'progress-steps__number--active' : ''}`}
            >
              {index === 0 ? <Icon name="stepCheck" size={14} /> : index}
            </span>
            <div>
              <strong>{title}</strong>
              <small>{caption}</small>
            </div>
            {index < 3 && <Icon name="chevronRight" size={12} />}
          </li>
        ))}
      </ol>
      <p>A contratação depende de parecer financeiro positivo vigente.</p>
    </section>
  )
}
