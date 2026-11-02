import { useState } from 'react'
import { useNavigate } from 'react-router'
import { formatMoney } from '../../data/demo.js'
import { usePrototype } from '../../state/prototype-store.js'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import { Badge } from '../ui/Feedback.jsx'

const images = import.meta.glob('../../assets/figma/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})
export function VehicleImage({ vehicle, className = '', ...props }) {
  return (
    <img
      className={`vehicle-image ${className}`}
      src={images[`../../assets/figma/${vehicle.image}`]}
      alt={vehicle.name}
      {...props}
    />
  )
}

export default function VehicleCard({ vehicle, landing = false, days = 5 }) {
  const [favorite, setFavorite] = useState(false)
  const { dispatch } = usePrototype()
  const navigate = useNavigate()
  function select() {
    dispatch({ type: 'VEHICLE', id: vehicle.id })
    navigate(landing ? '/entrar' : `/veiculos/${vehicle.id}`)
  }
  const price = landing ? vehicle.landingDaily : vehicle.daily
  return (
    <article className={`vehicle-card ${landing ? 'vehicle-card--landing' : ''}`}>
      <div className="vehicle-card__top">
        <Badge>{landing ? vehicle.group : vehicle.category}</Badge>
        {landing && (
          <button
            type="button"
            className={`icon-button ${favorite ? 'icon-button--selected' : ''}`}
            aria-label={
              favorite ? `Remover ${vehicle.name} dos favoritos` : `Favoritar ${vehicle.name}`
            }
            aria-pressed={favorite}
            onClick={() => setFavorite(!favorite)}
          >
            <Icon name="heart" />
          </button>
        )}
      </div>
      <VehicleImage vehicle={vehicle} />
      <div className="vehicle-card__identity">
        <h3>{vehicle.name}</h3>
        <p>
          {landing
            ? 'ou similar da mesma categoria'
            : `${vehicle.year} · ${vehicle.plate} · ${vehicle.registration}`}
        </p>
      </div>
      <ul className="vehicle-specs">
        <li>
          <Icon name="settings" size={16} />
          Automático
        </li>
        <li>
          <Icon name="users" size={16} />5 pessoas
        </li>
        <li>
          <Icon name="briefcase" size={16} />2 malas
        </li>
      </ul>
      <div className="vehicle-card__pricing">
        {landing && vehicle.originalDaily && <del>{formatMoney(vehicle.originalDaily)}</del>}
        <div className="vehicle-card__price-row">
          <p className="vehicle-price">
            <span>R$</span> {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            <small>/ diária</small>
          </p>
          <Badge tone="success">{landing ? 'Categoria de exemplo' : 'Disponível'}</Badge>
        </div>
      </div>
      <p className="vehicle-card__caption">
        {landing
          ? 'Valores ilustrativos · condições sujeitas à análise'
          : `${days} dias · proposta de ${formatMoney(days * vehicle.daily)}`}
      </p>
      <Button className="button--full" onClick={select}>
        {landing ? 'Consultar opções' : 'Ver automóvel'}
      </Button>
    </article>
  )
}
