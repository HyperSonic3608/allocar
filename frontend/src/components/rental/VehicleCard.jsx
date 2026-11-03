import { useNavigate } from 'react-router'
import { useApp } from '../../state/app-context.js'
import { formatMoney, vehiclePresentation } from '../../data/rental.js'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import { Badge } from '../ui/Feedback.jsx'

const images = import.meta.glob('../../assets/figma/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function VehicleImage({ vehicle, className = '', ...props }) {
  const item = vehicle.modelo ? vehiclePresentation(vehicle) : vehicle
  if (!item.image)
    return (
      <div
        className={`vehicle-image vehicle-image--placeholder ${className}`}
        role="img"
        aria-label={`Imagem não disponível para ${item.name}`}
      >
        <Icon name="car" size={48} />
        <span>Imagem não disponível</span>
      </div>
    )
  return (
    <img
      className={`vehicle-image ${className}`}
      src={images[`../../assets/figma/${item.image}`]}
      alt={item.name}
      {...props}
    />
  )
}

export default function VehicleCard({ vehicle, landing = false }) {
  const { setDraft } = useApp()
  const navigate = useNavigate()
  const item = landing ? vehicle : vehiclePresentation(vehicle)
  function select() {
    if (landing) {
      navigate('/veiculos')
      return
    }
    setDraft((draft) => ({ ...draft, vehicleId: item.id }))
    navigate(`/veiculos/${item.id}`)
  }
  return (
    <article className={`vehicle-card ${landing ? 'vehicle-card--landing' : ''}`}>
      <div className="vehicle-card__top">
        <Badge>{landing ? item.group : `Matrícula ${item.registration}`}</Badge>
      </div>
      <VehicleImage vehicle={item} />
      <div className="vehicle-card__identity">
        <h3>{item.name}</h3>
        <p>{landing ? 'ou similar da mesma categoria' : `${item.year} · ${item.plate}`}</p>
      </div>
      {landing && (
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
      )}
      <div className="vehicle-card__pricing">
        {landing && item.originalDaily && <del>{formatMoney(item.originalDaily)}</del>}
        <div className="vehicle-card__price-row">
          {landing ? (
            <p className="vehicle-price">
              <span>R$</span>
              {item.landingDaily.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <small>/ diária</small>
            </p>
          ) : (
            <h3>Valor a propor</h3>
          )}
          <Badge tone={landing ? 'success' : 'neutral'}>
            {landing ? 'Categoria de exemplo' : 'Catálogo'}
          </Badge>
        </div>
      </div>
      <p className="vehicle-card__caption">
        {landing
          ? 'Valores ilustrativos · condições sujeitas à análise'
          : 'Informe o período e o valor total da proposta antes de solicitar.'}
      </p>
      <Button className="button--full" onClick={select}>
        {landing ? 'Consultar opções' : 'Ver automóvel'}
      </Button>
    </article>
  )
}
