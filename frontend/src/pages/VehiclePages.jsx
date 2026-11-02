import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import PageLayout, { Columns, SidePanel, Stack } from '../components/layout/PageLayout.jsx'
import Card, { Metadata, PageHeading } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import VehicleCard, { VehicleImage } from '../components/rental/VehicleCard.jsx'
import { vehicles, rentalDays } from '../data/demo.js'
import { usePrototype } from '../state/prototype-store.js'

export function VehicleSearchPage() {
  const { state, dispatch } = usePrototype()
  const [params, setParams] = useSearchParams()
  const brand = params.get('marca') || ''
  const [start, setStart] = useState(state.start)
  const [end, setEnd] = useState(state.end)
  const navigate = useNavigate()
  const filtered = vehicles.filter((vehicle) => !brand || vehicle.brand === brand)
  function filter(key, value) {
    const next = new URLSearchParams(params)
    if (next.get(key) === value) next.delete(key)
    else next.set(key, value)
    setParams(next)
  }
  return (
    <PageLayout figmaId="92:2697" footer={null} className="vehicle-search-page">
      <PageHeading
        eyebrow="ALUGAR UM CARRO · 1 DE 4"
        title="Encontre o carro para o seu próximo caminho."
        description="Escolha um automóvel e confira os detalhes antes de solicitar o aluguel."
      />
      <Card
        as="form"
        className="search-period"
        onSubmit={(event) => {
          event.preventDefault()
          if (end <= start) {
            event.currentTarget
              .querySelector('[name=fim]')
              .setCustomValidity('A data final deve ser posterior à inicial.')
            event.currentTarget.reportValidity()
            return
          }
          dispatch({ type: 'DRAFT', values: { start, end } })
        }}
      >
        <Field
          label="Início do aluguel"
          type="date"
          icon={null}
          name="inicio"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          required
        />
        <Field
          label="Término do aluguel"
          type="date"
          icon={null}
          name="fim"
          value={end}
          onChange={(event) => {
            event.target.setCustomValidity('')
            setEnd(event.target.value)
          }}
          required
        />
        <p className="muted">
          {rentalDays(start, end)} dias de aluguel
          <br />
          Período demonstrativo
        </p>
        <Button type="submit">Atualizar busca</Button>
      </Card>
      <div className="search-layout">
        <Card className="search-filters">
          <h2>Refine sua busca</h2>
          <p className="muted">Marca</p>
          {['Chevrolet', 'Volkswagen'].map((name) => (
            <Button
              key={name}
              variant="secondary"
              aria-pressed={brand === name}
              className={brand === name ? 'filter-selected' : ''}
              onClick={() => filter('marca', name)}
            >
              {name}
            </Button>
          ))}
          <p className="muted">Ano do automóvel</p>
          <Button
            variant="secondary"
            onClick={() => filter('ano', '2025')}
            aria-pressed={params.get('ano') === '2025'}
          >
            2025
          </Button>
          <Button variant="secondary" onClick={() => navigate('/veiculos/sem-resultados')}>
            2026 · sem resultados
          </Button>
          <Button variant="secondary" onClick={() => setParams({})}>
            Limpar filtros
          </Button>
        </Card>
        <Stack>
          <div className="search-results-heading">
            <h2>
              {filtered.length} automóve{filtered.length === 1 ? 'l disponível' : 'is disponíveis'}{' '}
              para solicitar
            </h2>
            <p className="muted">Marca, modelo, ano e identificação informados antes do pedido.</p>
          </div>
          <div className="vehicle-grid">
            {filtered.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                days={rentalDays(state.start, state.end)}
              />
            ))}
          </div>
        </Stack>
      </div>
    </PageLayout>
  )
}

export function VehicleDetailPage() {
  const { id } = useParams()
  const { dispatch } = usePrototype()
  const navigate = useNavigate()
  const vehicle = vehicles.find((item) => item.id === id) || vehicles[0]
  return (
    <PageLayout figmaId="92:2698" footer={null}>
      <PageHeading
        eyebrow="AUTOMÓVEIS · 2 DE 4"
        title="Conheça o automóvel escolhido."
        description="Consulte a identificação e siga para o período e o tipo de contrato."
      />
      <Columns>
        <Card>
          <VehicleImage vehicle={vehicle} className="vehicle-detail-photo" />
          <h2 className="large-title">{vehicle.name}</h2>
          <p className="muted">
            {vehicle.year} · {vehicle.plate} · {vehicle.registration}
          </p>
          <Metadata
            title="Identificação do automóvel"
            items={[
              ['Marca', vehicle.brand],
              ['Modelo', vehicle.model],
              ['Ano', vehicle.year],
              ['Matrícula / placa', `${vehicle.registration} · ${vehicle.plate}`],
            ]}
          />
        </Card>
        <SidePanel title="Seu próximo passo" className="side-panel--spaced">
          <p>Informe o período e confira o contrato. O envio inicia a análise financeira.</p>
          <Metadata
            title="Propriedade"
            items={[
              ['Proprietário', 'Hyper Locadora'],
              ['Tipo', 'Empresa agente'],
              ['Diária ilustrativa', 'R$ 250,00'],
              ['Período de referência', '5 dias'],
            ]}
          />
          <Button
            onClick={() => {
              dispatch({ type: 'VEHICLE', id: vehicle.id })
              navigate('/pedidos/novo')
            }}
          >
            Selecionar automóvel
          </Button>
          <Button to="/veiculos" variant="secondary">
            Voltar à busca
          </Button>
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function EmptySearchPage() {
  return (
    <PageLayout figmaId="92:2705" className="expanded-page" footer={null}>
      <PageHeading
        className="page-heading--spaced"
        title="Nenhum automóvel para estes filtros."
        description="Ano selecionado: 2026. Tente outro ano ou remova os filtros."
      />
      <Card>
        <h2 className="large-title">Vamos encontrar outra opção?</h2>
        <p>
          Os automóveis deste exemplo são do ano de 2025. Limpe os filtros para voltar a consultar
          as opções.
        </p>
        <Button to="/veiculos" className="empty-action">
          Limpar filtros
        </Button>
        <Button to="/pedidos" variant="secondary" className="empty-action">
          Meus pedidos
        </Button>
      </Card>
    </PageLayout>
  )
}
