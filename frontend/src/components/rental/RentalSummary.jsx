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
